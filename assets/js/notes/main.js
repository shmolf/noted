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

/** @type {JQuery} */
let $noteListNav;

/** @type {JQuery} */
let $noteListTemplate;

/** @type {CodeMirror} */
let codeMirrorEditor;

/** @type {Worker|null} */
let worker = null;

let md;

// Since CodeMirror.setValue() triggers a change event, we'll want to prevent change events when manually setting value
let manuallySettingValue = false;

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

$(() => {
  $title = $('#note-title');
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  $noteListNav = $('#note-navigation');
  $noteListTemplate = $('#note-item-template');

  M.Modal.init($settingsModal, {
    // onCloseStart: () => clearModal(),
    onOpenEnd: () => {
      $settingsModal.scrollTop(0);
      $('#codemirror-theme').val(localStorage.getItem(CM_THEME_COOKIE) || 'default');
    },
  });

  initCodeMirror(sample);
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
  manuallySettingValue = true;
  codeMirrorEditor.setValue(sample);
  manuallySettingValue = false;

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
  let parsedFrontMatter;

  try {
    parsedFrontMatter = loadFront(markdown);
  } catch(e) {
    console.warn(e);
    return markdown;
  }
  const pagePlaceholder = /\{\{ page\.([^}}]+) \}\}/g;
  let { __content: content, ...data } = parsedFrontMatter;

  const matches = [...markdown.matchAll(pagePlaceholder)]
    .map((match) => match[1])
    .filter((value, index, self) => self.indexOf(value) === index);

  matches.forEach((match) => {
    let value;
    try {
      // eslint-disable-next-line no-eval
      value = eval(`data.${match}`);
    } catch (e) {
      console.warn(`Could not interpret '${match}'. Error:\n${e}`);
      return;
    }

    if (value !== undefined) {
      const regexString = `\\{\\{ page\\.${escapeRegExp(match)} \\}\\}`;
      const placeholderMatch = new RegExp(regexString, 'g');
      content = content.replaceAll(placeholderMatch, value);
    }
  });

  return content;
}

/**
 * Initialized the Markdown-It library
 */
function initMarkdownIt() {
  md = mdIt()
    .use(markdownItApexCharts)
    // .use(mdItGraphs)
    .use(mdItEmoji);

  md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
}

/**
 * Initialized the CodeMirror library
 */
function initCodeMirror() {
  /** @see https://codemirror.net/doc/manual.html#config */
  const cmOptions = {
    // mode: 'gfm',
    mode: {
      name: 'gfm',
      tokenTypeOverrides: {
        emoji: 'emoji',
      },
    },
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
    if (manuallySettingValue) {
      return;
    }

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
  renderMarkdown(markdown);

  if (worker === null) {
    return;
  }

  const note = packageNote(markdown);

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
 * @returns {NotePackage}
 */
function packageNote(markdown) {
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
      case workerStates.READY.k:
        worker.postMessage(clientActions.GET_LIST.f());
        break;
      case workerStates.NOTE_DATA.k:
        const { data: noteData } = msg;
        $editor.data('noteUuid', noteData.noteUuid);
        $editor.data('clientUuid', noteData.clientUuid);
        manuallySettingValue = true;
        codeMirrorEditor.setValue(noteData.content);
        manuallySettingValue = false;
        renderMarkdown(noteData.content);
        break;
      case workerStates.NOTE_LIST.k:
        const { data: list } = msg;
        renderNoteList(list);
        break;
      case workerStates.UPD8_COMP.k:
        const { data: response } = msg;
        console.log(response);
        break;
      default:
    }
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * @param {NoteListItem[]} notes
 */
function renderNoteList(notes) {
  $noteListNav.find('.note-item:not(#note-load-template)').off('click').detach();

  notes.forEach((note) => {
    const $noteBtn = $noteListTemplate.clone().removeAttr('id');
    const lastModified = new Date(`${note.lastModified.date} ${note.lastModified.timezone}`);

    $noteBtn
      .data('client-uuid', note.clientUuid)
      .data('last-modified', note.lastModified)
      .data('created', note.createdDate)
      .find('.title').text(note.title || lastModified.toString());

    const $tagTemplate = $noteBtn.find('#note-tag-template').clone().removeAttr('id');
    note.tags.forEach((tag) => $noteBtn.find('.tag-container').append($tagTemplate.clone().text(tag)));

    $noteBtn.on('click', (event) => {
      const eventUuid = $(event.currentTarget).data('clientUuid');
      worker.postMessage(clientActions.GET_BY_CLIENTUUID.f(eventUuid));
    });

    $noteListNav.append($noteBtn);
  });
}

/**
 * @typedef {Object} NoteListItem
 * @property {string} title
 * @property {string[]} tags
 * @property {string} noteUuid
 * @property {string} clientUuid
 * @property {string} inTrashcan
 * @property {string} createdDate
 * @property {Object} lastModified
 * @property {string} lastModified.date
 * @property {string} lastModified.timezone
 * @property {number} lastModified.timezone_type
 */
