import $ from 'jquery';
import M from 'materialize-css';

import mdIt from 'markdown-it';
import mdItUml from 'markdown-it-plantuml';
import mdItEmoji from 'markdown-it-emoji';
import twemoji from 'twemoji';
import mdItFrontMatter from 'markdown-it-front-matter';
import { loadFront } from 'yaml-front-matter';
// import mdItPrism from 'markdown-it-prism';
// import loadLanguages from 'prismjs/components/';

import hljs from 'highlightjs';
import CodeMirror from './code-mirror-assets';

import 'CSS/notes.scss';

// Prevent console errors from unknown languages
// loadLanguages.silent = true;

/** @type {JQuery} */
let $editor;

/** @type {JQuery} */
let $mdView;

/** @type {JQuery} */
let $settingsModal;

/** @type {CodeMirror.EditorFromTextArea} */
let codeMirrorEditor;

let md;

M.Modal.init($settingsModal, {
  // onCloseStart: () => clearModal(),
  onOpenEnd: () => $settingsModal.scrollTop(0),
});

const markdownTest = `
Doctrine Setup

Create a new Schema
\`\`\`bash
php bin/console doctrine:database:create
\`\`\`

Create a new Entity
\`\`\`bash
php bin/console make:entity
\`\`\`

Create the migration
\`\`\`bash
php bin/console make:migration
\`\`\`

Apply the Migration
\`\`\`bash
php bin/console doctrine:migrations:migrate
\`\`\`

\`\`\`js
$(() => {
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  initCodeMirror();
  initMarkdownIt();
  $mdView.on('click', () => renderMarkdown());
});
\`\`\`
`;

$(() => {
  $settingsModal = $('#settings-popup');
  $editor = $('#markdown-input');
  $mdView = $('#markdown-output');
  initCodeMirror();
  initMarkdownIt();
  $mdView.on('click', () => renderMarkdown());
  $('#codemirror-theme').on('change', (e) => {
    const theme = $(e.currentTarget).val();
    codeMirrorEditor.setOption('theme', theme);
  });
});

/**
 * Grabs the input from Code Mirror, and uses Markdown-It to render the output.
 */
function renderMarkdown() {
  const parsedMarkdown = parseFrontMatter(markdownTest); // codeMirrorEditor.getValue());
  const render = md.render(parsedMarkdown);
  $mdView.html(render);
}

/**
 * @param {string} markdown
 * @returns {string}
 */
function parseFrontMatter(markdown) {
  const data = loadFront(markdown);

  (markdown.match(/{{ page\.(.+) }}/g) || []).forEach((match) => {
    // eslint-disable-next-line no-eval
    const value = eval(`data.${match}`);
    if (value !== undefined) {
      match.replace(`{{ page.${match} }}`, value);
    }
  });

  return markdown;
}

/**
 * Initialized the Markdown-It library
 */
function initMarkdownIt() {
  const umlOptions = {
    openMarker: '@startditaa',
    closeMarker: '@endditaa',
    diagramName: 'ditaa',
    imageFormat: 'png',
  };

  const markdownItOptions = {
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(lang, str, true).value}</code></pre>`;
        } catch (__) {}
      }

      return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
    },
  };

  md = mdIt(markdownItOptions)
    .use(mdItUml, umlOptions)
    .use(mdItEmoji)
    .use(mdItFrontMatter, (frontMatter) => {
      const fm = frontMatter.split(/\n/);
      console.log(fm);
    });
    // .use(mdItPrism);

  md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
}

/**
 * Initialized the CodeMirror library
 */
function initCodeMirror() {
  /** @type {CodeMirror.EditorConfiguration} */
  const cmOptions = {
    mode: {
      name: 'gfm',
      tokenTypeOverrides: {
        emoji: 'emoji',
      },
    },
    lineNumbers: true,
    viewportMargin: 500,
    lineWrapping: true,
    theme: 'neat',
    tabindex: 0,
    extraKeys: {
      F11: (cm) => cm.setOption('fullScreen', !(cm.getOption('fullScreen'))),
      Esc: (cm) => {
        if (cm.getOption('fullScreen')) {
          cm.setOption('fullScreen', false);
        }
      },
    },
  };

  codeMirrorEditor = CodeMirror.fromTextArea(/** @type {HTMLTextAreaElement} */($editor.get(0)), cmOptions);
}

/**
 * @param {String} theme
 */
function setCodeMirrorTheme(theme) {
  codeMirrorEditor.setOption('theme', theme);
  codeMirrorEditor.refresh();
}
