import $ from 'jquery';
import M from 'materialize-css';
import 'STYLES/users/admin.css';
import { DateTime } from 'SCRIPTS/types/Api';

let $editUserModal:JQuery;
let $editRoleChips:JQuery;
let $form:JQuery;

interface UserFormData {
    firstName: string,
    lastName: string,
    email: string,
    roles: string[],
}

interface UserData {
    email: string,
    lastName?: string,
    firstName?: string,
    roles?: string,
    createdDate?: DateTime,
}

$(() => {
  $editUserModal = $('#edit-user');
  $editRoleChips = $editUserModal.find('.chips');
  $form = $('#edit-form');

  M.Modal.init($editUserModal.get(0) as HTMLElement, {
    onCloseStart: () => clearEditForm(),
    onOpenEnd: () => $form.scrollTop(0),
  });

  $form.find('#save-user').on('click', (e) => {
    e.preventDefault();
    $(e.currentTarget).attr('disabled', 'disabled');
    saveUser();
  });

  $('.edit-user').on('click', (e) => {
    const $editBtn: JQuery = $(e.currentTarget);
    const $userItem: JQuery = $editBtn.closest('.collection-item');
    const roles: string[] = [];
    $userItem.find('.roles .chip').each((_, role) => {
      roles.push(String(role.textContent));
    });

    const userData: UserFormData = {
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
  $form.find('#first-name').val('');
  $form.find('#last-name').val('');
  $form.find('#email').val('');

  clearChips(M.Chips.getInstance($editRoleChips.get(0) as HTMLElement));
}

/**
 * @param data
 */
function populateForm(data: UserFormData) {
  $form.find('#first-name').val(data.firstName);
  $form.find('#last-name').val(data.lastName);
  $form.find('#email').val(data.email);

  const chipsInstance = M.Chips.getInstance($editRoleChips.get(0) as HTMLElement);
  data.roles.forEach((role) => {
    chipsInstance.addChip({ tag: role });
  });

  M.updateTextFields();
}

/**
 *
 */
function saveUser() {
  const chipsInstance = M.Chips.getInstance($editRoleChips.get(0) as HTMLElement);
  const roles = chipsInstance.chipsData.map((chip) => chip.tag.trim());
  const url = decodeURI(String($form.attr('action')));
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
    M.Modal.getInstance($editUserModal.get(0) as HTMLElement).close();

    // const userData = (response as UserData);
    // console.debug(userData);
  }).fail((_, __, error) => {
    // eslint-disable-next-line no-console
    console.error(error);
  });
}

/**
 * @param chipInstance
 */
function clearChips(chipInstance: M.Chips) {
  const cachedChipsData = chipInstance.chipsData.map((chip) => chip);
  cachedChipsData.forEach(() => {
    chipInstance.deleteChip(0);
  });
}
