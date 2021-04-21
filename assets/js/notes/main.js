import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/notes.scss';

import { v4 as uuidv4 } from 'uuid';
import noteDb, { NOTE_ACTIONS } from 'JS/notes/noteDb';
import { workerStates, clientActions } from 'JS/notes/worker-client-api';
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
let $editor;

/** @type {JQuery} */
let $mdView;

/** @type {JQuery} */
let $settingsModal;

/** @type {CodeMirror.EditorFromTextArea} */
let codeMirrorEditor;

let md;

M.Modal.init($settingsModal, {
  // onCloseStart: () => clearModal(),
  onOpenEnd: () => {
    $settingsModal.scrollTop(0);
    $('#codemirror-theme').val(localStorage.getItem(CM_THEME_COOKIE) || 'default');
  },
});

$(() => {
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
  /** @type {CodeMirror.EditorConfiguration} */
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

  codeMirrorEditor.on('change', (editor, changes) => {
    const markdown = editor.getValue();
    renderMarkdown(markdown);
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
    /** @type {Worker} */
    const worker = new Worker();
    worker.postMessage(JSON.stringify({
      some: 'data',
    }));
    worker.onmessage = (e) => onWorkerMessage(worker, e);
  }
}

/**
 * @param {Worker} worker
 * @param {MessageEvent} event
 */
function onWorkerMessage(worker, event) {
  const msg = JSON.parse(event.data);
  if ('state' in msg) {
    switch (msg.state) {
      case workerStates.TEST:
        worker.postMessage(clientActions.MODIFY.f(testNote));
        worker.postMessage(clientActions.MODIFY.f(testNoteUuid));
        break;
      case workerStates.TEST_READY:
        worker.postMessage(clientActions.GET_BY_UUID.f(testNote.clientUuid));
        break;
      case workerStates.NOTE_DATA:
        const noteData = msg.note;
        console.log(noteData);
        break;
      default:
    }
  }
}

/** @type {import('JS/notes/noteDb').ModifyNote} */
const testNote = {
  clientUuid: uuidv4(),
  title: 'test note',
  content: 'note body test',
  tags: ['tag1', 'tag2'],
  action: NOTE_ACTIONS.update,
};

/** @type {import('JS/notes/noteDb').ModifyNote} */
const testNoteUuid = {
  uuid: 'fake',
  clientUuid: uuidv4(),
  title: 'test note uuid',
  content: 'note body test uuid',
  tags: ['tag1', 'tag2'],
  action: NOTE_ACTIONS.update,
};
