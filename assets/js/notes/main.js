import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/notes.scss';

import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import { initMarkdownIt, renderMarkdown } from 'JS/notes/markdown-output';
import { initNoteNav, renderNoteList, getNavItem, setNavItemSaveState, setNavItemTitle } from 'JS/notes/note-nav';
import { v4 as uuidv4 } from 'uuid';
import FileDownload from 'js-file-download';
import Worker from './note.worker';
import Cookies from 'JS/lib/cookie';
// @ts-ignore
import sample from './sample.md';

// Library for the input side
import CodeMirror from './code-mirror-assets';

// ---- Now, begins the application logic ----

const CM_THEME_COOKIE = 'cs-theme';
const PAGE_THEME_COOKIE = 'page-theme';
const HLJS_THEME_COOKIE = 'hljs-theme';


/** @type {JQuery} */
let $newNoteBtn;

/** @type {JQuery} */
let $editor;

/** @type {JQuery} */
let $settingsModal;

/** @type {JQuery} */
let $pageTheme;

/** @type {JQuery} */
let $codeMirrorTheme;

/** @type {JQuery} */
let $highlightJsTheme;

let $inputOutput;

/** @type {CodeMirror} */
let codeMirrorEditor;

/** @type {Worker|null} */
let worker = null;

// Since CodeMirror.setValue() triggers a change event, we'll want to prevent change events when manually setting value
let manuallySettingValue = false;

/** @type {Object.<string, NoteQueue>} */
const modifiedNotes = {};

const noteSaveDelay = 3 * 1000;
const noteDelayMax = 10 * 1000;

/** @type {string|null} */
const cmTheme = localStorage.getItem(CM_THEME_COOKIE);

$(() => {
  loadSw();
  initJqueryVariables();

  if (cmTheme !== null) {
    // Need to set the select menu value, before Materialize is initialized.
    $codeMirrorTheme.val(cmTheme);
  }

  initMaterialize();
  initCodeMirror();
  initMarkdownIt();
  initNoteNav();

  if (cmTheme !== null) {
    setCodeMirrorTheme(cmTheme);
    $codeMirrorTheme.val(cmTheme);
    $codeMirrorTheme.find(`[value="${cmTheme}"`).attr('selected', 'selected');
  }

  renderMarkdown(sample);
  manuallySettingValue = true;
  codeMirrorEditor.setValue(sample);
  manuallySettingValue = false;

  eventListeners();
});

function eventListeners() {
  $pageTheme.on('change', updatePageTheme);
  $codeMirrorTheme.on('change', updateCodeMirrorTheme);
  $highlightJsTheme.on('change', updateHighlightJsTheme);
  $newNoteBtn.on('click', newNote);

  $('.show-cookie-pref').on('click', () => {
    M.Modal.getInstance($settingsModal.get(0))?.close();
  });

  $('.export-notes').on('click', () => worker.postMessage(clientActions.EXPORT_NOTES.f()));

  $('.toggle-view').on('click', () => {
    $('.toggle-view i').toggleClass('fa-book-open').toggleClass('fa-edit');
    $inputOutput.toggleClass('expanded');
  });

  $(document).on('change', '.task-list-item-checkbox', (e) => {
    const $codeMirrorLines = $('.CodeMirror-line');
    const $renderedChecklist = $('#output-wrap input.task-list-item-checkbox');
    // Get the index of the checkbox
    const checkboxIndex = $renderedChecklist.index(e.currentTarget);
    const newCheckedText = e.currentTarget.checked ? 'x' : ' ';

    const $mdInpChecklist = $codeMirrorLines.find('.cm-meta:contains("[ ]"), .cm-property:contains("[x]")');
    const $cmCheckbox = $($mdInpChecklist.get(checkboxIndex));

    let cmLine = $codeMirrorLines.index($cmCheckbox.parents('.CodeMirror-line').first());
    let cmCol = $cmCheckbox.closest('.CodeMirror-line').text().indexOf('[');

    codeMirrorEditor.replaceRange(
        newCheckedText,
        {
            'line': cmLine,
            'ch': ++cmCol,
        },
        {
            'line': cmLine,
            'ch': ++cmCol,
        }
    );
  });

  $(document).on('click', '.note-item', (event) => {
    const eventUuid = $(event.currentTarget).data('clientUuid');
    worker.postMessage(clientActions.GET_BY_CLIENTUUID.f(eventUuid));
  });

  $('#delete-note').on('click', (event) => {
    const eventUuid = $('#note-menu').data('uuid');

    if (eventUuid === undefined) {
      return;
    }

    getNavItem(eventUuid).attr('disabled', 'disabled');
    worker.postMessage(clientActions.DEL_BY_CLIENTUUID.f(eventUuid));
  });
}

function initJqueryVariables() {
  $pageTheme = $('#page-theme');
  $codeMirrorTheme = $('#codemirror-theme');
  $highlightJsTheme = $('#highlightjs-theme');
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $inputOutput = $('#input-wrap, #output-wrap');

  $newNoteBtn = $('#new-note');
}

/**
 * Initialized the CodeMirror library
 */
function initCodeMirror() {
  /** @see https://codemirror.net/doc/manual.html#config */
  const cmOptions = {
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

  // @ts-ignore
  codeMirrorEditor = CodeMirror.fromTextArea(/** @type {HTMLTextAreaElement} */($editor.get(0)), cmOptions);

  codeMirrorEditor.on('change', (editor) => {
    if (manuallySettingValue) {
      return;
    }

    queueNoteSave(editor);
  });
}

function initMaterialize() {
  M.Modal.init($settingsModal, {
    // onCloseStart: () => clearModal(),
    onOpenEnd: () => {
      $settingsModal.scrollTop(0);
      $('#codemirror-theme').val(localStorage.getItem(CM_THEME_COOKIE) || 'default');
    },
  });

  M.FormSelect.init($codeMirrorTheme);
}

function updatePageTheme() {
  const optionClasses = $pageTheme.find('option').map((i, element) => element.value).get().join(' ');
  const selectedTheme = String($pageTheme.val()).trim();
  Cookies.store(PAGE_THEME_COOKIE, selectedTheme);

  $(document.body).removeClass(optionClasses).addClass(selectedTheme);
}

function updateCodeMirrorTheme() {
  const theme = String($codeMirrorTheme.val());
  setCodeMirrorTheme(theme);
}

function updateHighlightJsTheme() {
  const selectedTheme = String($highlightJsTheme.val()).trim();
  Cookies.store(HLJS_THEME_COOKIE, selectedTheme);

  $('link[title].current').attr('disabled', 'disabled').removeClass('current');
  $(`link[title="${selectedTheme}"]`).removeAttr("disabled").addClass('current');
}

function newNote() {
  manuallySettingValue = true;
  // @ts-ignore
  codeMirrorEditor.setValue('');
  manuallySettingValue = false;
  renderMarkdown('');
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
  const frontmatterData = renderMarkdown(markdown);
  $inputOutput.addClass('not-saved');

  if (worker === null) {
    return;
  }

  let title = frontmatterData.title ?? null;
  const note = packageNote(markdown, title);

  if (!$editor.data('clientUuid')) {
    $editor.data('clientUuid', note.clientUuid);
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
  title = typeof note.title === 'string' && note.title.trim().length > 0
    ? note.title
    : (new Date()).toDateString();
  setNavItemTitle(note.clientUuid, title);
  setNavItemSaveState(note.clientUuid, 'inProgress');

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
 * @param {string} uuid
 * @returns {boolean}
 */
function noteIsQueuedForSave(uuid) {
  return uuid in modifiedNotes;
}

/**
 * @param {string} content
 * @param {?string} title
 * @returns {NotePackage}
 */
function packageNote(content, title) {
  let clientUuid = $editor.data('clientUuid') || uuidv4();
  clientUuid = typeof clientUuid === 'string' ? clientUuid.trim() : null;
  title = typeof title === 'string' ? title.trim() : '';
  const tags = [];

  return new NotePackage({
    clientUuid,
    title,
    content,
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
        $editor.data('clientUuid', noteData.clientUuid);
        manuallySettingValue = true;
        // @ts-ignore
        codeMirrorEditor.setValue(noteData.content);
        manuallySettingValue = false;
        $editor.scrollTop(0);
        renderMarkdown(noteData.content);
        break;
      case workerStates.NOTE_LIST.k:
        const { data: list } = msg;
        renderNoteList(list);
        break;
      case workerStates.UPD8_COMP.k:
        const { data: response } = msg;

        setNavItemSaveState(response.clientUuid, 'save');
        setTimeout(() => {
          setNavItemSaveState(response.clientUuid, 'default');
        }, 3000);

        if (!(noteIsQueuedForSave(response.clientUuid)) && $editor.data('clientUuid') === response.clientUuid) {
          $inputOutput.removeClass('not-saved').addClass('saved');

          setTimeout(() => {
            if (!(noteIsQueuedForSave(response.clientUuid)) && $editor.data('clientUuid') === response.clientUuid) {
              $inputOutput.removeClass('saved');
            }
          }, 3000);
        }
        break;
      case workerStates.DEL_COMP.k:
        const { data: delUuid } = msg;
        getNavItem(delUuid).detach();
        break;
      case workerStates.EXPORT_DATA.k:
        const { data: notes } = msg;
        FileDownload(JSON.stringify(notes, null, 2), `export-notes-${(new Date()).toDateString()}.json`);
      default:
    }
  }
}

/**
 * @typedef {object} NoteQueue
 * @property {Date} firstTimeout - Used to compare how much delay has passed since the edits started
 * @property {number} delayedCount
 * @property {number} timeoutId
 */
