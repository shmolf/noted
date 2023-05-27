import $ from 'jquery';
import { AjaxErrorRepsonse } from 'SCRIPTS/types/Api';

let $form: JQuery;
let $errorOutput: JQuery;

$(() => {
  $form = $('#account-details');
  $errorOutput = $('#form-errors');

  $form.on('submit', (e) => {
    e.preventDefault();
    enableSaveBtn(false);
    saveUser();
  });
});

/**
 *
 */
function saveUser() {
  clearErrorOutput();
  const url = decodeURI(String($form.attr('action')));
  const password = $form.find('#password').val();
  const passwordConfirmation = $form.find('#password-confirm').val();

  if (password !== passwordConfirmation) {
    appendToErrorOutput('Passwords must match');
    enableSaveBtn(true);
    return;
  }

  const data = {
    'first-name': String($form.find('#first-name').val()).trim(),
    'last-name': String($form.find('#last-name').val()).trim(),
    email: String($form.find('#email').val()).trim(),
    password: String($form.find('#password').val()),
  };

  $.post({
    url,
    data,
  }).done(() => {
    window.location.href = '/login';
  }).fail((xhr) => {
    try {
      const { responseJSON } = xhr;
      if ('errors' in responseJSON) {
        const { errors } = responseJSON as AjaxErrorRepsonse;
        errors.forEach((error) => appendToErrorOutput(error));
      }
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.error('Could not identify errors', exception, xhr.responseText);
      enableSaveBtn(true);
    }
  });
}

function clearErrorOutput() {
  $errorOutput.html('');
}

function appendToErrorOutput(error: string) {
  $errorOutput.append(`<p class="error">${error}</p>`);
}

function enableSaveBtn(enabled = true) {
  $form.find('#create-btn').attr('disabled', enabled ? '' : 'disabled');
}
