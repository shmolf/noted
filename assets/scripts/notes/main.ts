import $ from 'jquery';
import M from 'materialize-css';
import 'STYLES/notes.scss';

import { MapStringTo } from 'SCRIPTS/types/Generic';
import {
  workerStates,
  clientActions,
  NotePackage,
  WorkspacePackage,
} from 'SCRIPTS/notes/worker-client-api';
import { initMarkdownIt, renderMarkdown } from 'SCRIPTS/notes/markdown-output';
import {
  initNoteNav,
  renderNoteList,
  getNavItem,
  setNavItemSaveState,
  setNavItemTitle,
  clearNoteList,
} from 'SCRIPTS/notes/note-nav';
import FileDownload from 'js-file-download';
// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!./note.worker';
import Cookies from 'SCRIPTS/lib/cookie';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CodeMirror from 'codemirror';

import { removeSpinner, showSpinner } from 'SCRIPTS/lib/loading-spinner';
// eslint-disable-next-line import/extensions
import CM from './code-mirror-assets';
// import { EditorView, init as initEdit, posToOffset, offsetToPos, createChangeListener } from './code-mirror-assets';
// import { ViewUpdate } from '@codemirror/view';
import sample from './sample.md';

// ---- Now, begins the application logic ----

interface NoteQueue {
  /**
   * Used to compare how much delay has passed since the edits started
   */
  firstTimeout: Date;
  delayedCount: number;
  timeoutId: number|null;
}

const CM_THEME_COOKIE = 'cs-theme';
const PAGE_THEME_COOKIE = 'page-theme';
const HLJS_THEME_COOKIE = 'hljs-theme';

let $newNoteBtn: JQuery;
let $editor: JQuery;
let $settingsModal: JQuery;
let $pageTheme: JQuery;
let $codeMirrorTheme: JQuery;
let $highlightJsTheme: JQuery;
let $inputOutput: JQuery;
let $noteNavMenu: JQuery;
let $notedContainer: JQuery;
let $activeWorkspace: JQuery;

let codeMirrorEditor: CodeMirror.Editor;
// let codeMirrorEditor: EditorView;

let worker: Worker|null = window.Worker ? new Worker() : null;

// Since CodeMirror.setValue() triggers a change event, we'll want to prevent change events when manually setting value
let manuallySettingValue = false;

const modifiedNotes: MapStringTo<NoteQueue> = {};

const noteSaveDelay = 3 * 1000;
const noteDelayMax = 10 * 1000;

/** @type {string|null} */
const cmTheme = localStorage.getItem(CM_THEME_COOKIE);

$(() => {
  loadSw();
  initJqueryVariables();
  startInitialPageSpinners();

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
  // codeMirrorEditor.dispatch({
  //     changes: { from: 0, to: codeMirrorEditor.state.doc.length, insert: sample}
  // });
  manuallySettingValue = false;

  eventListeners();
  removeSpinner($notedContainer.get(0));
});

function startInitialPageSpinners() {
  showSpinner($noteNavMenu.get(0));
  showSpinner($notedContainer.get(0));
}

function requestWorkspace() {
  clearNoteList();
  const uuid = String($activeWorkspace.val());
  worker?.postMessage(clientActions.GET_WKSP_BYUUID.f(uuid));
}

function eventListeners() {
  $pageTheme.on('change', updatePageTheme);
  $codeMirrorTheme.on('change', updateCodeMirrorTheme);
  $highlightJsTheme.on('change', updateHighlightJsTheme);
  $newNoteBtn.on('click', newNote);

  $('.show-cookie-pref').on('click', () => {
    M.Modal.getInstance($settingsModal.get(0))?.close();
  });

  $('.export-notes').on('click', () => worker?.postMessage(clientActions.EXPORT_NOTES.f()));

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

    const cmLine = $codeMirrorLines.index($cmCheckbox.parents('.CodeMirror-line').first());
    let cmCol = $cmCheckbox.closest('.CodeMirror-line').text().indexOf('[');

    codeMirrorEditor.replaceRange(
      newCheckedText,
      {
        line: cmLine,
        ch: cmCol += 1,
      },
      {
        line: cmLine,
        ch: cmCol += 1,
      },
    );
  });

  $(document).on('click', '.note-item', (event) => {
    const eventUuid = $(event.currentTarget).data('uuid');

    if (!(eventUuid ?? false)) throw new Error('UUID was not available');

    showSpinner($notedContainer.get(0));
    showSpinner($noteNavMenu.get(0));
    worker?.postMessage(clientActions.GET_BY_UUID.f(eventUuid));
  });

  $('#delete-note').on('click', () => {
    const eventUuid = $('#note-menu').data('uuid');

    if (!(eventUuid ?? false)) throw new Error('UUID was not available');

    getNavItem(eventUuid).attr('disabled', 'disabled');
    worker?.postMessage(clientActions.DEL_BY_UUID.f(eventUuid));
  });

  $activeWorkspace.on('change', () => requestWorkspace());
}

function initJqueryVariables() {
  $pageTheme = $('#page-theme');
  $codeMirrorTheme = $('#codemirror-theme');
  $highlightJsTheme = $('#highlightjs-theme');
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $inputOutput = $('#input-wrap, #output-wrap');
  $newNoteBtn = $('#new-note');
  $noteNavMenu = $('#note-navigation');
  $notedContainer = $('#noted');
  $activeWorkspace = $('#active-workspace');
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
  };

  codeMirrorEditor = CM.fromTextArea($editor.get(0), cmOptions);

  codeMirrorEditor.on('change', (editor) => {
    if (manuallySettingValue) return;

    queueNoteSave(editor.getValue());
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
  Cookies.store(HLJS_THEME_COOKIE, selectedTheme, 365);

  $('link[title].current').attr('disabled', 'disabled').removeClass('current');
  $(`link[title="${selectedTheme}"]`).removeAttr('disabled').addClass('current');
}

function newNote() {
  $newNoteBtn.attr('disabled', 'disabled');
  showSpinner($notedContainer.get(0));
  removeSpinner($noteNavMenu.get(0));
  worker?.postMessage(clientActions.NEW_NOTE.f());
  manuallySettingValue = true;
  codeMirrorEditor.setValue('');
  manuallySettingValue = false;
  renderMarkdown('');
}

function setCodeMirrorTheme(theme: string) {
  localStorage.setItem(CM_THEME_COOKIE, theme);

  codeMirrorEditor.setOption('theme', theme);
  codeMirrorEditor.refresh();
}

function loadSw() {
  if (window.Worker) {
    worker = new Worker();
    worker.onmessage = (e) => onWorkerMessage(e);
  }
}

function queueNoteSave(markdown: string) {
  const frontmatterData = renderMarkdown(markdown);
  $inputOutput.addClass('not-saved');

  if (worker === null) return;

  let title = frontmatterData.title ?? null;
  const note = packageNote(markdown, title);
  const uuid = note.uuid as string;

  if (!$editor.data('uuid')) {
    $editor.data({ uuid });
  }

  if (uuid in modifiedNotes) {
    clearTimeout(modifiedNotes[uuid].timeoutId ?? 0);
  } else {
    modifiedNotes[uuid] = {
      firstTimeout: new Date(),
      delayedCount: 0,
      timeoutId: null,
    };
  }

  const totalDelay = (new Date()).getTime() - modifiedNotes[uuid].firstTimeout.getTime();
  // If ``note.title` is nullish, default to an empty string. If the title (or default) are empty, use the current date
  title = (note.title || '').trim() || (new Date()).toDateString();
  setNavItemTitle(uuid, title);
  setNavItemSaveState(uuid, 'inProgress');

  if (totalDelay >= noteDelayMax) {
    delete modifiedNotes[uuid];
    worker.postMessage(clientActions.MODIFY.f(note));
  } else {
    modifiedNotes[uuid].delayedCount += 1;
    modifiedNotes[uuid].timeoutId = window.setTimeout(() => {
      delete modifiedNotes[uuid];
      worker?.postMessage(clientActions.MODIFY.f(note));
    }, noteSaveDelay);
  }
}

/**
 * @param {string} uuid
 * @returns {boolean}
 */
function noteIsQueuedForSave(uuid: string): boolean {
  return uuid in modifiedNotes;
}

/**
 * @param content
 * @param title
 */
function packageNote(content: string, noteTitle: string|null): NotePackage {
  let uuid = $editor.data('uuid');
  uuid = typeof uuid === 'string' ? uuid.trim() : null;
  const title = typeof noteTitle === 'string' ? noteTitle.trim() : '';
  const tags: string[] = [];

  return new NotePackage({
    uuid,
    title,
    content,
    tags,
    inTrashcan: false,
  });
}

function disableWorkspaceOption(uuid: string) {
  $activeWorkspace.find(`option[value=${uuid}]`).attr('disabled', 'disabled');
}

function getFirstEnabledWorkspace(): string {
  return String($activeWorkspace.find('option:not(:disabled)').first().attr('value'));
}

function setWorkspaceMenuByUuid(uuid: string) {
  $activeWorkspace.val(uuid);
}

function onWorkerMessage(event: MessageEvent) {
  const msg = JSON.parse(event.data);
  if ('state' in msg && worker !== null) {
    switch (msg.state) {
      case workerStates.READY.k:
        requestWorkspace();
        break;
      case workerStates.NOTE_DATA.k: {
        const noteData = msg.data as NotePackage;
        const content = noteData.content ?? '';

        $editor.data('uuid', noteData.uuid);
        manuallySettingValue = true;
        codeMirrorEditor.setValue(content);
        manuallySettingValue = false;
        $editor.scrollTop(0);
        renderMarkdown(content);
        removeSpinner($notedContainer.get(0));
        removeSpinner($noteNavMenu.get(0));
        break;
      }
      case workerStates.NOTE_LIST.k: {
        const { data: list } = msg;
        renderNoteList(list);
        removeSpinner($noteNavMenu.get(0));
        break;
      }
      case workerStates.NEW_NOTE_READY.k: {
        const { data: response } = msg;

        setNavItemTitle(response.uuid, '');
        setNavItemSaveState(response.uuid, 'default');

        $editor.data('uuid', response.uuid);
        $inputOutput.removeClass('not-saved saved');

        removeSpinner($notedContainer.get(0));
        removeSpinner($noteNavMenu.get(0));
        $newNoteBtn.attr('disabled', null);
        break;
      }
      case workerStates.UPD8_COMP.k: {
        const { data: response } = msg;

        setNavItemSaveState(response.uuid, 'save');
        setTimeout(() => setNavItemSaveState(response.uuid, 'default'), 3000);

        if (!(noteIsQueuedForSave(response.uuid)) && $editor.data('uuid') === response.uuid) {
          $inputOutput.removeClass('not-saved').addClass('saved');

          setTimeout(() => {
            if (!(noteIsQueuedForSave(response.uuid)) && $editor.data('uuid') === response.uuid) {
              $inputOutput.removeClass('saved');
            }
          }, 3000);
        }
        break;
      }
      case workerStates.DEL_COMP.k: {
        const { data: delUuid } = msg;
        getNavItem(delUuid).detach();
        break;
      }
      case workerStates.EXPORT_DATA.k: {
        const { data: notes } = msg;
        FileDownload(JSON.stringify(notes, null, 2), `export-notes-${(new Date()).toDateString()}.json`);
        break;
      }
      case workerStates.WORKSPACE_DATA.k: {
        // Need to decide who's responsible for refreshing the refresh token. Prolly the worker.
        // They'd also need to update the workspace.
        const workspace: WorkspacePackage = msg.data;
        worker?.postMessage(clientActions.GET_LIST.f());
        break;
      }
      case workerStates.WORKSPACE_INVALID.k: {
        const uuid: string = msg.data;
        disableWorkspaceOption(uuid);
        setWorkspaceMenuByUuid(getFirstEnabledWorkspace());
        requestWorkspace();
        break;
      }
      default:
    }
  }
}
