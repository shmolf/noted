import $ from 'jquery';
import 'CSS/app.scss';
import M from 'materialize-css';
import 'materialize-css/dist/css/materialize.css';
// import 'w3-css/w3.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'font-awesome-animation/font-awesome-animation.scss';

import MakeClickable from 'JS/ada/EmulateButton';

$(() => {
  $('.is-button').each((_, element) => {
    MakeClickable(element);
  });
  $('.chip').on('mousout', (e) => {
    $(e.currentTarget).trigger('blur');
  });
  M.AutoInit();
});
