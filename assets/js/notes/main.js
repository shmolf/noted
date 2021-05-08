import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/notes.scss';

import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import Worker from './note.worker';
import Cookies from 'JS/lib/cookie';
// @ts-ignore
import sample from './sample.md';

// Libraries for the Markdown Render
import mdIt from 'markdown-it';
import * as d3 from 'd3';
// @ts-ignore
import markdownItApexCharts, { ApexRender } from 'markdown-it-apexcharts';
import mdItEmoji from 'markdown-it-emoji';
import twemoji from 'twemoji';
import { loadFront } from 'yaml-front-matter';
import hljs from 'highlight.js';

// Library for the input side
import CodeMirror from './code-mirror-assets';

// ---- Now, begins the application logic ----

const CM_THEME_COOKIE = 'cs-theme';
const PAGE_THEME_COOKIE = 'page-theme';
const HLJS_THEME_COOKIE = 'hljs-theme';


/** @type {JQuery} */
let $newNoteBtn;

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

/** @type {JQuery} */
let $pageTheme;

/** @type {JQuery} */
let $codeMirrorTheme;

/** @type {JQuery} */
let $highlightJsTheme;

/** @type {JQuery} */
let $triggerElementAutoCloseNav;

let $inputOutput;

/** @type {CodeMirror} */
let codeMirrorEditor;

/** @type {Worker|null} */
let worker = null;

let md;

// Since CodeMirror.setValue() triggers a change event, we'll want to prevent change events when manually setting value
let manuallySettingValue = false;

/** @type {Object.<string, NoteQueue>} */
const modifiedNotes = {};

const noteSaveDelay = 3 * 1000;
const noteDelayMax = 10 * 1000;

$(() => {
  loadSw();
  initJqueryVariables();
  initMaterialize();
  initCodeMirror();
  initMarkdownIt();

  $pageTheme.on('change', updatePageTheme);
  $codeMirrorTheme.on('change', updateCodeMirrorTheme);
  $highlightJsTheme.on('change', updateHighlightJsTheme);
  $newNoteBtn.on('click', newNote);

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

  $('.toggle-nav').on('click', (e) => {
    e.stopPropagation();
    $(document).off('click', autoCloseNav);
    $('.toggle-nav i').removeClass('fa-chevron-right').addClass('fa-chevron-left');
    $('#note-navigation').toggleClass('expanded');
    $(document).on('click', '#noted, #new-note, #note-navigation .note-item', autoCloseNav);
  });

  $('.toggle-view').on('click', () => {
    $('.toggle-view i').toggleClass('fa-book-open').toggleClass('fa-edit');
    $inputOutput.toggleClass('expanded');
  });
});

function autoCloseNav() {
  $(document).off('click', autoCloseNav);
  $('.toggle-nav i').addClass('fa-chevron-right').removeClass('fa-chevron-left');
  $('#note-navigation').removeClass('expanded');
}

function initJqueryVariables() {
  $pageTheme = $('#page-theme');
  $codeMirrorTheme = $('#codemirror-theme');
  $highlightJsTheme = $('#highlightjs-theme');
  $title = $('#note-title');
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  $noteListNav = $('#note-items');
  $noteListTemplate = $('#note-item-template');
  $inputOutput = $('#input-wrap, #output-wrap');

  $newNoteBtn = $('#new-note');
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
 * Grabs the input from Code Mirror, and uses Markdown-It to render the output.
 * Since part of the rendering process includes extracting FrontMatter data, this'll return
 * that data to the callsite, where it can use it for additional work. Like updating the title.
 *
 * @param {string} markdown
 */
function renderMarkdown(markdown) {
  const { content, data } = parseFrontMatter(markdown);
  const render = md.render(content, { d3 });
  $mdView.html(render);
  ApexRender();
  $mdView.find('pre code').each((i, elem) => {
    const codeBlock = elem;
    codeBlock.innerHTML = hljs.highlightAuto(elem.textContent).value;
  });

  return data;
}

/**
 * @param {string} markdown
 * @returns {{content: string, data: Object.<string, any>}}
 */
function parseFrontMatter(markdown) {
  let parsedFrontMatter;

  try {
    parsedFrontMatter = loadFront(markdown);
  } catch(e) {
    console.warn(e);
    return { content: markdown, data: {} };
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

  return { content, data };
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
  let clientUuid = $editor.data('clientUuid') || null;
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
        console.log('deltion completed');
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
    const lastModified = new Date(`${note.lastModified.date} ${note.lastModified.timezone}`);
    const createdDate = new Date(`${note.createdDate.date} ${note.createdDate.timezone}`);

    const $noteBtn = createNewNoteNavItem(note.clientUuid, note.title, note.tags, lastModified, createdDate);
    $noteListNav.append($noteBtn);
  });
}

/**
 *
 * @param {string} clientUuid
 * @param {string} title
 * @param {string[]} tags
 * @param {?Date} lastModifiedDate
 * @param {?Date} createdDate
 * @returns {JQuery}
 */
function createNewNoteNavItem(clientUuid, title, tags, lastModifiedDate, createdDate) {
  const $noteBtn = $noteListTemplate.clone().removeAttr('id');
  const lastModified = lastModifiedDate ?? new Date();
  const created = createdDate ?? new Date();
  const noteTitle = title || lastModified.toDateString();

  $noteBtn
    .data('client-uuid', clientUuid)
    .data('last-modified', lastModified.toDateString())
    .data('created', created.toDateString())
    .attr('data-tooltip', noteTitle)
    .find('.title').text(noteTitle);

    M.Tooltip.init($noteBtn);

  const $tagTemplate = $noteBtn.find('#note-tag-template').clone().removeAttr('id');
  tags.forEach((tag) => $noteBtn.find('.tag-container').append($tagTemplate.clone().text(tag)));

  $noteBtn.on('click', (event) => {
    const tooltipInstance = M.Tooltip.getInstance(event.currentTarget);
    tooltipInstance.close();
    const eventUuid = $(event.currentTarget).data('clientUuid');
    worker.postMessage(clientActions.GET_BY_CLIENTUUID.f(eventUuid));
  });

  return $noteBtn;
}

function setNavItemTitle(uuid, title) {
  let $navListItem = getNavItem(uuid);

  if ($navListItem.length === 0) {
    $navListItem = createNewNoteNavItem(uuid, title, [], null, null);
  } else {
    $navListItem.find('.title').text(title);
  }

  $noteListNav.prepend($navListItem);
}

/**
 * @param {string} uuid
 * @param {'save'|'inProgress'|'default'} state
 */
function setNavItemSaveState(uuid, state) {
  const stateClasses = {
    save: 'saved',
    inProgress: 'not-saved',
    default: '',
  };

  let $navListItem = getNavItem(uuid);

  if (state in stateClasses) {
    const allStateClasses = Object.values(stateClasses).join(' ');
    $navListItem.removeClass(allStateClasses).addClass(stateClasses[state]);
  }
}

/**
 * @param {string} uuid
 * @returns {JQuery}
 */
function getNavItem(uuid) {
  return $noteListNav
    .find('.note-item')
    .filter((i, elem) => String($(elem).data('client-uuid')) === uuid);
}

/**
 * @typedef {Object} NoteListItem
 * @property {string} title
 * @property {string[]} tags
 * @property {string} clientUuid
 * @property {string} inTrashcan
 * @property {DateTime} createdDate
 * @property {DateTime} lastModified
 */

/**
 * @typedef {Object} DateTime
 * @property {string} date
 * @property {string} timezone
 * @property {number} timezone_type
 */

/**
 * @typedef {object} NoteQueue
 * @property {Date} firstTimeout - Used to compare how much delay has passed since the edits started
 * @property {number} delayedCount
 * @property {number} timeoutId
 */
