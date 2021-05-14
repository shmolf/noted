import $ from 'jquery';

import mdIt from 'markdown-it';
import * as d3 from 'd3';
// @ts-ignore
import markdownItApexCharts, { ApexRender } from 'markdown-it-apexcharts';
import mdItEmoji from 'markdown-it-emoji';
// @ts-ignore
import mdItCheckbox from 'markdown-it-task-lists';
import twemoji from 'twemoji';
import { loadFront } from 'yaml-front-matter';
import hljs from 'highlight.js';

let md;

/** @type {JQuery} */
let $mdView;

/**
 * Initialized the Markdown-It library
 */
export function initMarkdownIt() {
  $mdView = $('#markdown-output');
  md = mdIt()
    .use(markdownItApexCharts)
    // .use(mdItGraphs)
    .use(mdItEmoji)
    .use(mdItCheckbox, {
      enabled: true,
    });

  md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
}

/**
 * Grabs the input from Code Mirror, and uses Markdown-It to render the output.
 * Since part of the rendering process includes extracting FrontMatter data, this'll return
 * that data to the callsite, where it can use it for additional work. Like updating the title.
 *
 * @param {string} markdown
 * @returns {{[x: string]: any}
 */
export function renderMarkdown(markdown) {
  const { content, data } = parseFrontMatter(markdown);
  const render = md.render(content, { d3 });
  $mdView.html(render);
  ApexRender();
  $mdView.find('pre code').each((i, elem) => {
    const codeBlock = elem;
    codeBlock.innerHTML = hljs.highlightAuto(elem.textContent).value;
  });

  return data;
}

/**
 * @param {string} markdown
 * @returns {{content: string, data: Object.<string, any>}}
 */
function parseFrontMatter(markdown) {
  let parsedFrontMatter;

  try {
    parsedFrontMatter = loadFront(markdown);
  } catch (e) {
    console.warn(e);
    return { content: markdown, data: {} };
  }
  const pagePlaceholder = /\{\{ page\.([^}}]+) \}\}/g;
  // eslint-disable-next-line prefer-const
  let { __content: content, ...data } = parsedFrontMatter;

  const matches = [...markdown.matchAll(pagePlaceholder)]
    .map((match) => match[1])
    .filter((value, index, self) => self.indexOf(value) === index);

  matches.forEach((match) => {
    let value;
    try {
      // eslint-disable-next-line no-eval
      value = eval(`data.${match}`);
    } catch (e) {
      console.warn(`Could not interpret '${match}'. Error:\n${e}`);
      return;
    }

    if (value !== undefined) {
      const regexString = `\\{\\{ page\\.${escapeRegExp(match)} \\}\\}`;
      const placeholderMatch = new RegExp(regexString, 'g');
      content = content.replaceAll(placeholderMatch, value);
    }
  });

  return { content, data };
}

/**
 * @param {string} string
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
