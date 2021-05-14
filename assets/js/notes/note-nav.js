import $ from 'jquery';

/** @type {JQuery} */
let $noteListNav;

/** @type {JQuery} */
let $noteListTemplate;

/** @type {JQuery} */
let $menu;

/** @type {JQuery} */
let $outClick;

export function initNoteNav () {
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
      .data('uuid', $(e.currentTarget).data('client-uuid'));

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

/**
 * @param {NoteListItem[]} notes
 */
 export function renderNoteList(notes) {
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
 export function createNewNoteNavItem(clientUuid, title, tags, lastModifiedDate, createdDate) {
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
  });

  return $noteBtn;
}

export function setNavItemTitle(uuid, title) {
  let $navListItem = getNavItem(uuid);

  if ($navListItem.length === 0) {
    $navListItem = createNewNoteNavItem(uuid, title, [], null, null);
  } else {
    const tooltipInstacne = M.Tooltip.getInstance($navListItem.get(0));
    tooltipInstacne.destroy();
    $navListItem.attr('data-tooltip', title);
    M.Tooltip.init($navListItem);

    $navListItem.find('.title').text(title);
  }

  $noteListNav.prepend($navListItem);
}

/**
 * @param {string} uuid
 * @param {'save'|'inProgress'|'default'} state
 */
 export function setNavItemSaveState(uuid, state) {
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
export function getNavItem(uuid) {
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
