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

let md: mdIt;
let $mdView: JQuery;

/**
 * Initialized the Markdown-It library
 */
export function initMarkdownIt() {
    $mdView = $('#markdown-output');
    md = mdIt()
        .use(markdownItApexCharts)
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

function parseFrontMatter(markdown: string) {
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

    const matches = Array.from(markdown.matchAll(pagePlaceholder))
        .map((match: RegExpMatchArray) => match[1])
        .filter((value, index, self) => self.indexOf(value) === index);

    // This'll try to get a value from an object/array, given a path given as an array. Defaults to `null` if not found.
    const get = (path: string[], obj: any): any|null => path.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, obj);
    const splitDotNotation = (str: string): string[] => str.split('.');
    const splitIndexNotation = (str: string): string[] => {
        /*
        * Consider if `str` is `fruits[0][1]`
        * We expect the array from a split to be `["fruits", "0", "", "1", ""]`
        * Notice that the first index should be the only even index that should have a value.
        *
        * Take as a counter example: `fruits[0][1]invalidText`
        * This'll yield `["fruits", "0", "", "1", "invalidText"]`, where index 4 (an even, non-zero index) has a value.
        */

        return str.split(/\[([^\]]+)\]/).reduce((parts, part, i) => {
            return part === '' || i === 0 || i % 2 === 1 ? parts : parts.concat([part]);
        }, new Array<string>());
    };

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

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
