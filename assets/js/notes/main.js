import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/notes.scss';

import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import Worker from './note.worker';
import 'JS/lib/cookie';
// @ts-ignore
import sample from './sample.md';

// Libraries for the Markdown Render
import mdIt from 'markdown-it';
// @ts-ignore
import mdItGraphs from 'markvis';
import * as d3 from 'd3';
// @ts-ignore
import markdownItApexCharts, { ApexRender } from 'markdown-it-apexcharts';
import mdItEmoji from 'markdown-it-emoji';
import twemoji from 'twemoji';
import mdItFrontMatter from 'markdown-it-front-matter';
import { loadFront } from 'yaml-front-matter';
import hljs from 'highlight.js';
import 'NODE/highlight.js/styles/gruvbox-dark.css';

// Library for the input side
import CodeMirror from './code-mirror-assets';

// ---- Now, begins the application logic ----

const CM_THEME_COOKIE = 'cs-theme';

/** @type {JQuery} */
let $title;

/** @type {JQuery} */
let $editor;

/** @type {JQuery} */
let $mdView;

/** @type {JQuery} */
let $settingsModal;

/** @type {CodeMirror} */
let codeMirrorEditor;

/** @type {Worker|null} */
let worker = null;

let md;

/**
 * @typedef {object} NoteQueue
 * @property {Date} firstTimeout - Used to compare how much delay has passed since the edits started
 * @property {number} delayedCount
 * @property {number} timeoutId
 */

/** @type {Object.<string, NoteQueue>} */
const modifiedNotes = {};

const noteSaveDelay = 3 * 1000;
const noteDelayMax = 10 * 1000;

M.Modal.init($settingsModal, {
  // onCloseStart: () => clearModal(),
  onOpenEnd: () => {
    $settingsModal.scrollTop(0);
    $('#codemirror-theme').val(localStorage.getItem(CM_THEME_COOKIE) || 'default');
  },
});

$(() => {
  $title = $('#note-title');
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  initCodeMirror();
  initMarkdownIt();
  $('#codemirror-theme').on('change', (e) => {
    const theme = String($(e.currentTarget).val());
    setCodeMirrorTheme(theme);
  });

  const cmTheme = localStorage.getItem(CM_THEME_COOKIE);
  if (cmTheme !== null) {
    setCodeMirrorTheme(cmTheme);
  }

  renderMarkdown(sample);
  codeMirrorEditor.setValue(sample);

  $('.show-cookie-pref').on('click', () => {
    M.Modal.getInstance($settingsModal.get(0))?.close();
  });
  loadSw();
});

/**
 * Grabs the input from Code Mirror, and uses Markdown-It to render the output.
 * @param {string} markdown
 */
function renderMarkdown(markdown) {
  const parsedMarkdown = parseFrontMatter(markdown);
  const render = md.render(parsedMarkdown, { d3 });
  $mdView.html(render);
  ApexRender();
  // $mdView.find('pre code').each((i, elem) => prismjs.highlightElement(elem));
  $mdView.find('pre code').each((i, elem) => {
    const codeBlock = elem;
    codeBlock.innerHTML = hljs.highlightAuto(elem.textContent).value;
  });
}

/**
 * @param {string} markdown
 * @returns {string}
 */
function parseFrontMatter(markdown) {
  const data = loadFront(markdown);

  (markdown.match(/{{ page\.(.+) }}/g) || []).forEach((match) => {
    // eslint-disable-next-line no-eval
    const value = eval(`data.${match}`);
    if (value !== undefined) {
      match.replace(`{{ page.${match} }}`, value);
    }
  });

  return markdown;
}

/**
 * Initialized the Markdown-It library
 */
function initMarkdownIt() {
  md = mdIt()
    .use(markdownItApexCharts)
    .use(mdItGraphs)
    .use(mdItEmoji)
    .use(mdItFrontMatter, (frontMatter) => {
      const fm = frontMatter.split(/\n/);
      console.log(fm);
    });

  md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
}

/**
 * Initialized the CodeMirror library
 */
function initCodeMirror() {
  /** @see https://codemirror.net/doc/manual.html#config */
  const cmOptions = {
    mode: 'gfm',
    // mode: {
    //   name: 'gfm',
    //   tokenTypeOverrides: {
    //     emoji: 'emoji',
    //   },
    // },
    lineNumbers: true,
    viewportMargin: 500,
    lineWrapping: true,
    theme: 'default',
    tabindex: 0,
    extraKeys: {
      F11: (cm) => cm.setOption('fullScreen', !(cm.getOption('fullScreen'))),
      Esc: (cm) => {
        if (cm.getOption('fullScreen')) {
          cm.setOption('fullScreen', false);
        }
      },
    },
  };

  codeMirrorEditor = CodeMirror.fromTextArea(/** @type {HTMLTextAreaElement} */($editor.get(0)), cmOptions);

  codeMirrorEditor.on('change', (editor) => {
    queueNoteSave(editor);
  });
}

/**
 * @param {String} theme
 */
function setCodeMirrorTheme(theme) {
  localStorage.setItem(CM_THEME_COOKIE, theme);

  codeMirrorEditor.setOption('theme', theme);
  codeMirrorEditor.refresh();
}

function loadSw() {
  if (window.Worker) {
    worker = new Worker();
    worker.postMessage(JSON.stringify({
      some: 'data',
    }));
    worker.onmessage = (e) => onWorkerMessage(e);
  }
}

/**
 * @param {CodeMirror} editor
 */
function queueNoteSave(editor) {
  const markdown = editor.getValue();
  const note = packageNote(markdown);
  renderMarkdown(markdown);

  // Implies 'Worker' is not ready, or available
  if (note === null) {
    return;
  }

  if (note.clientUuid in modifiedNotes) {
    clearTimeout(modifiedNotes[note.clientUuid].timeoutId);
  } else {
    modifiedNotes[note.clientUuid] = {
      firstTimeout: new Date(),
      delayedCount: 0,
      timeoutId: null,
    };
  }

  const totalDelay = (new Date()).getTime() - modifiedNotes[note.clientUuid].firstTimeout.getTime();

  if (totalDelay >= noteDelayMax) {
    delete modifiedNotes[note.clientUuid];
    worker.postMessage(clientActions.MODIFY.f(note));
  } else {
    modifiedNotes[note.clientUuid].delayedCount += 1;
    modifiedNotes[note.clientUuid].timeoutId = window.setTimeout(() => {
      delete modifiedNotes[note.clientUuid];
      worker.postMessage(clientActions.MODIFY.f(note));
    }, noteSaveDelay);
  }
}

/**
 * @param {string} markdown
 * @returns {?NotePackage}
 */
function packageNote(markdown) {
  if (worker === null) {
    return null;
  }

  let noteUuid = $editor.data('noteUuid');
  noteUuid = typeof noteUuid === 'string' ? noteUuid.trim() : null;
  let clientUuid = $editor.data('clientUuid') || null;
  clientUuid = typeof clientUuid === 'string' ? clientUuid.trim() : null;
  let title = $title.val();
  title = typeof title === 'string' ? title.trim() : null;
  const tags = [];

  return new NotePackage({
    noteUuid,
    clientUuid,
    title,
    content: markdown,
    tags,
    inTrashcan: false,
  });
}

/**
 * @param {MessageEvent} event
 */
function onWorkerMessage(event) {
  const msg = JSON.parse(event.data);
  if ('state' in msg && worker !== null) {
    switch (msg.state) {
      case workerStates.TEST:
        worker.postMessage(clientActions.MODIFY.f(testNote));
        break;
      case workerStates.TEST_READY:
        worker.postMessage(clientActions.GET_BY_CLIENTUUID.f(testNote.clientUuid));
        break;
      case workerStates.READY:
        worker.postMessage(clientActions.GET_LIST.f());
        break;
      case workerStates.NOTE_DATA:
        const noteData = msg.note;
        console.log(noteData);
        break;
      case workerStates.NOTE_LIST:
        console.log(msg.list);
        break;
      default:
    }
  }
}

const testNote = new NotePackage({
  title: 'test note',
  content: 'note body test',
  tags: ['tag1', 'tag2'],
  inTrashcan: false,
});
