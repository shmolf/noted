import $ from 'jquery';
import { DateTime } from 'SCRIPTS/types/Api';

interface NoteListItem {
  title: string,
  tags: string[],
  uuid: string,
  inTrashcan: string,
  createdDate: DateTime|string,
  lastModified: DateTime|string,
}

export interface saveStates {
  save: string,
  inProgress: string,
  default: string,
}

let $noteListNav: JQuery;
let $noteListTemplate: JQuery;
let $menu: JQuery;
let $outClick: JQuery;

export function initNoteNav(): void {
  $noteListNav = $('#note-items');
  $noteListTemplate = $('#note-item-template');
  $menu = $('#note-menu');
  $outClick = $('#note-menu-out-click');
  eventListeners();
}

function eventListeners() {
  $('.toggle-nav').on('click', (e) => {
    e.stopPropagation();
    $(document).off('click', autoCloseNav);
    $('.toggle-nav i').removeClass('fa-chevron-right').addClass('fa-chevron-left');
    $('#note-navigation').toggleClass('expanded');
    $(document).on('click', '#noted, #new-note, #note-navigation .note-item', autoCloseNav);
  });

  $(document).on('contextmenu', '#note-items .note-item', (e) => {
    e.preventDefault();

    $menu
      .css({
        top: `${e.clientY}px`,
        left: `${e.clientX}px`,
      })
      .addClass('show')
      .data('uuid', $(e.currentTarget).data('uuid'));

    $outClick.css({ display: 'block' });
  });

  $outClick.add($menu).on('click', () => {
    $menu.removeClass('show').data('uuid', null);
    $outClick.css('display', 'none');
  });
}

function autoCloseNav() {
  $(document).off('click', autoCloseNav);
  $('.toggle-nav i').addClass('fa-chevron-right').removeClass('fa-chevron-left');
  $('#note-navigation').removeClass('expanded');
}

export function clearNoteList(): void {
  $noteListNav.find('.note-item:not(#note-load-template)').off('click').detach();
}

export function renderNoteList(notes: NoteListItem[]): void {
  clearNoteList();

  notes.forEach((note) => {
    const lastModified = typeof note.lastModified === 'string'
      ? new Date(note.lastModified)
      : new Date(note.lastModified.date);

    const createdDate = typeof note.createdDate === 'string'
      ? new Date(note.createdDate)
      : new Date(note.createdDate.date);

    const $noteBtn = createNewNoteNavItem(note.uuid, note.title, note.tags, lastModified, createdDate);
    $noteListNav.append($noteBtn);
  });
}

export function createNewNoteNavItem(
  uuid: string,
  title: string,
  tags: string[],
  lastModifiedDate: Date|null,
  createdDate: Date|null,
): JQuery {
  const $noteBtn = $noteListTemplate.clone().removeAttr('id');
  const lastModified = lastModifiedDate ?? new Date();
  const created = createdDate ?? new Date();
  const noteTitle = title || lastModified.toDateString();

  $noteBtn
    .data({ uuid })
    .data('last-modified', lastModified.toDateString())
    .data('created', created.toDateString())
    .attr('data-tooltip', noteTitle)
    .find('.title')
    .text(noteTitle);

  M.Tooltip.init($noteBtn);

  const $tagTemplate = $noteBtn.find('#note-tag-template').clone().removeAttr('id');
  tags.forEach((tag) => $noteBtn.find('.tag-container').append($tagTemplate.clone().text(tag)));

  $noteBtn.on('click', (event) => {
    const tooltipInstance = M.Tooltip.getInstance(event.currentTarget);
    tooltipInstance.close();
  });

  return $noteBtn;
}

export function setNavItemTitle(uuid: string, title: string): void {
  let $navListItem = getNavItem(uuid);

  if ($navListItem.length === 0) {
    $navListItem = createNewNoteNavItem(uuid, title, [], null, null);
  } else {
    const tooltipInstance = M.Tooltip.getInstance($navListItem.get(0) as HTMLElement);
    tooltipInstance.destroy();
    $navListItem.attr('data-tooltip', title);
    M.Tooltip.init($navListItem);

    $navListItem.find('.title').text(title);
  }

  $noteListNav.prepend($navListItem);
}

export function setNavItemSaveState(uuid: string, state: keyof saveStates): void {
  const stateClasses: saveStates = {
    save: 'saved',
    inProgress: 'not-saved',
    default: '',
  };

  const $navListItem = getNavItem(uuid);

  if (state in stateClasses) {
    const allStateClasses = Object.values(stateClasses).join(' ');
    $navListItem.removeClass(allStateClasses).addClass(stateClasses[state]);
  }
}

export function getNavItem(uuid: string): JQuery {
  return $noteListNav
    .find('.note-item')
    .filter((i, elem) => String($(elem).data('uuid')) === uuid);
}
