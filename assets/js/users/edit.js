import $ from 'jquery';

/** @type {?JQuery} */
let $form = null;

/** @type {?JQuery} */
let $errorOutput = null;

$(() => {
  $form = $('#account-details');
  $errorOutput = $('#form-errors');

  $form.on('submit', (e) => {
    e.preventDefault();
    $form.find('#create-btn').attr('disabled', 'disabled');
    saveUser();
  });
});

function saveUser() {
  $errorOutput.html('');
  const url = decodeURI($form.attr('action'));
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
    $form.find('#create-btn').removeAttr('disabled');
  }).fail((xhr) => {
    try {
      const { responseJSON } = xhr;
      if ('errors' in responseJSON) {
        /** @type {string[]} */
        const { errors } = /** @type {AjaxError} */(responseJSON);
        errors.forEach((error) => $errorOutput.append(`<p class="error">${error}</p>`));
      }
    } catch (exception) {
      console.log('Could not identify errors', exception, xhr.responseText);
    }
  });
}

/**
 * @typedef AjaxError
 * @property {string} type
 * @property {string} title
 * @property {string[]} errors
 */
