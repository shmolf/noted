import $ from 'jquery';
import { AjaxErrorRepsonse } from 'JS/types/Api';

let $form: JQuery;
let $errorOutput: JQuery;

$(() => {
  $form = $('#account-details');
  $errorOutput = $('#form-errors');

  $form.on('submit', (e) => {
    e.preventDefault();
    $form.find('#create-btn').attr('disabled', 'disabled');
    saveUser();
  });
});

/**
 *
 */
function saveUser() {
  $errorOutput.html('');
  const url = decodeURI(String($form.attr('action')));
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
        errors.forEach((error) => $errorOutput.append(`<p class="error">${error}</p>`));
      }
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.debug('Could not identify errors', exception, xhr.responseText);
    }
  });
}
