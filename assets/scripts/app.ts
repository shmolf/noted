import $ from 'jquery';
import 'STYLES/app.scss';
import M from 'materialize-css';
import 'materialize-css/dist/css/materialize.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import MakeClickable from 'SCRIPTS/ada/EmulateButton';

$(() => {
  $('.is-button').each((_, element) => {
    MakeClickable(element);
  });
  $('.chip').on('mousout', (e) => {
    $(e.currentTarget).trigger('blur');
  });
  M.AutoInit();
});
