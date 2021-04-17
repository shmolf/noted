import 'NODE/prismjs/themes/prism-coy.css';
import 'NODE/prismjs/themes/prism-dark.css';
import 'NODE/prismjs/themes/prism-funky.css';
import 'NODE/prismjs/themes/prism-okaidia.css';
import 'NODE/prismjs/themes/prism-solarizedlight.css';
import 'NODE/prismjs/themes/prism-tomorrow.css';
import 'NODE/prismjs/themes/prism-twilight.css';
import 'NODE/prismjs/themes/prism.css';

import prismjs from 'prismjs';
import loadLanguages from 'prismjs/components/';

// Prevent console errors from unknown languages
loadLanguages.silent = true;

export default prismjs;
