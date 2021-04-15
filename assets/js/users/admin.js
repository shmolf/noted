import $ from 'jquery';
import M from 'materialize-css';
import 'CSS/users/admin.css';

/** @type {?JQuery} */
let $editUserModal = null;

/** @type {?JQuery} */
let $editRoleChips = null;

/** @type {?JQuery} */
let $form = null;

$(() => {
  $editUserModal = $('#edit-user');
  $editRoleChips = $editUserModal.find('.chips');
  $form = $('#edit-form');

  M.Modal.init($editUserModal.get(0), {
    onCloseStart: () => clearEditForm(),
    onOpenEnd: () => { console.log('here'); $form.scrollTop(0); },
  });

  $form.find('#save-user').on('click', (e) => {
    e.preventDefault();
    $(e.currentTarget).attr('disabled', 'disabled');
    saveUser();
  });

  $('.edit-user').on('click', (e) => {
    const $editBtn = $(e.currentTarget);
    const $userItem = $editBtn.closest('.collection-item');
    const roles = [];
    $userItem.find('.roles .chip').each((_, /** @type {Element} */role) => {
      roles.push(role.textContent);
    });

    const userData = {
      firstName: $editBtn.data('first-name'),
      lastName: $editBtn.data('last-name'),
      email: $editBtn.data('email'),
      roles,
    };

    populateForm(userData);
  });
});

/**
 * @returns {void}
 */
function clearEditForm() {
  $form.find('#save-user').removeAttr('disabled');
  $form.find('#first-name').val(null);
  $form.find('#last-name').val(null);
  $form.find('#email').val(null);

  clearChips(M.Chips.getInstance($editRoleChips.get(0)));
}

/**
 * @param {Object} data
 */
function populateForm(data) {
  $form.find('#first-name').val(data.firstName);
  $form.find('#last-name').val(data.lastName);
  $form.find('#email').val(data.email);

  const chipsInstance = M.Chips.getInstance($editRoleChips.get(0));
  data.roles.forEach((role) => {
    chipsInstance.addChip({ tag: role });
  });

  M.updateTextFields();
}

function saveUser() {
  const chipsInstance = M.Chips.getInstance($editRoleChips.get(0));
  const roles = chipsInstance.chipsData.map((chip) => chip.tag.trim());
  const url = decodeURI($form.attr('action'));
  const data = {
    'first-name': String($form.find('#first-name').val()).trim(),
    'last-name': String($form.find('#last-name').val()).trim(),
    email: String($form.find('#email').val()).trim(),
    roles,
  };

  $.ajax({
    url,
    data: JSON.stringify(data), // TODO, follow patch standard: https://tools.ietf.org/html/rfc7396
    type: 'PATCH',
    contentType: 'application/merge-patch+json',
  }).done((response) => {
    M.Modal.getInstance($editUserModal.get(0)).close();

    const userData = /** @type {UserData} */(response);
    console.log(userData);
  }).fail((xhr, status, error) => {
    console.log(xhr, status, error);
  });
}

/**
 * @param {M.Chips} chipInstance
 */
function clearChips(chipInstance) {
  const cachedChipsData = chipInstance.chipsData.map((chip) => chip);
  cachedChipsData.forEach(() => {
    chipInstance.deleteChip(0);
  });
}

/**
 * @typedef {Object} UserData
 * @property {string} email
 * @property {string} [lastName]
 * @property {string} [firstName]
 * @property {string[]} [roles]
 * @property {DateTime} [createdDate]
 */

/**
 * @typedef {Object} DateTime
 * @property {string} date
 * @property {string} timezone
 * @property {number} timezone_type
 */
