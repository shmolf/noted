import $ from 'jquery';

import mdIt from 'markdown-it';
import * as d3 from 'd3';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import markdownItApexCharts, { ApexRender } from 'markdown-it-apexcharts';
import mdItEmoji from 'markdown-it-emoji';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mdItCheckbox from 'markdown-it-task-lists';
// import twemoji from 'twemoji';
import frontMatter from 'front-matter';
import hljs from 'highlight.js';
import { MapStringTo } from 'SCRIPTS/types/Generic';

let md: mdIt;
let $mdView: JQuery;

/**
 * Initialized the Markdown-It library
 */
export function initMarkdownIt(): void {
  $mdView = $('#markdown-output');
  md = mdIt()
    .use(markdownItApexCharts)
    .use(mdItEmoji)
    .use(mdItCheckbox, {
      enabled: true,
    });

  // md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);
}

/**
 * Grabs the input from Code Mirror, and uses Markdown-It to render the output.
 * Since part of the rendering process includes extracting FrontMatter data, this'll return
 * that data to the callsite, where it can use it for additional work. Like updating the title.
 *
 * @param {string} markdown
 * @returns {{[x: string]: any}
 */
export function renderMarkdown(markdown: string): MapStringTo<any> {
  const { content, data } = parseFrontMatter(markdown);
  const render = md.render(content, { d3 });
  $mdView.html(render);
  ApexRender();
  $mdView.find('pre code').each((i, elem) => {
    const codeBlock = elem;
    codeBlock.innerHTML = hljs.highlightAuto(String(elem.textContent)).value;
  });

  return data;
}

/**
 * @param markdown
 */
function parseFrontMatter(markdown: string) {
  let parsedFrontMatter;

  try {
    parsedFrontMatter = frontMatter<{[key: string]: any}>(markdown);
  } catch (e) {
    console.warn(e);
    return { content: markdown, data: {} };
  }

  const pagePlaceholder = /\{\{ page\.([^}}]+) \}\}/g;
  // eslint-disable-next-line prefer-const
  let { body: content, attributes: data } = parsedFrontMatter;

  const matches = Array.from(markdown.matchAll(pagePlaceholder))
    .map((match: RegExpMatchArray) => match[1])
    .filter((value, index, self) => self.indexOf(value) === index);

  // This'll try to get a value from an object/array, given a path given as an array. Defaults to `null` if not found.
  const get = (path: string[], obj: any): any|null => path.reduce((xs, x) => ((xs && xs[x]) ? xs[x] : null), obj);
  const splitDotNotation = (str: string): string[] => str.split('.');
  const splitIndexNotation = (str: string): string[] => (
    /*
     * Consider if `str` is `fruits[0][1]`
     * We expect the array from a split to be `["fruits", "0", "", "1", ""]`
     * Notice that only `even` indexes would reference a valid number/key
     *
     * Take as a counter example: `fruits[0][1]invalidText`
     * This'll yield `["fruits", "0", "", "1", "invalidText"]`, where index 4 (an even, non-zero index) has a value.
     */
    str
      .split(/\[([^\]]+)\]/)
      .reduce(
        (parts, part, i) => (part === '' || (i > 0 && i % 2 === 0) ? parts : parts.concat([part])),
        new Array<string>(),
      )
  );
  matches.forEach((match) => {
    const pathArray = splitDotNotation(match)
      .reduce((pathArr, str) => pathArr.concat(splitIndexNotation(str)), new Array<string>());

    const value = get(pathArray, data);

    if (value !== undefined && value !== null) {
      const regexString = `\\{\\{ page\\.${escapeRegExp(match)} \\}\\}`;
      const placeholderMatch = new RegExp(regexString, 'g');
      content = content.replaceAll(placeholderMatch, value);
    }
  });

  return { content, data };
}

/**
 * @param string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
