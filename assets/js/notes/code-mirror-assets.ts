import 'NODE/codemirror/theme/3024-day.css';
import 'NODE/codemirror/theme/3024-night.css';
import 'NODE/codemirror/theme/abcdef.css';
import 'NODE/codemirror/theme/ambiance-mobile.css';
import 'NODE/codemirror/theme/ambiance.css';
import 'NODE/codemirror/theme/ayu-dark.css';
import 'NODE/codemirror/theme/ayu-mirage.css';
import 'NODE/codemirror/theme/base16-dark.css';
import 'NODE/codemirror/theme/base16-light.css';
import 'NODE/codemirror/theme/bespin.css';
import 'NODE/codemirror/theme/blackboard.css';
import 'NODE/codemirror/theme/cobalt.css';
import 'NODE/codemirror/theme/colorforth.css';
import 'NODE/codemirror/theme/darcula.css';
import 'NODE/codemirror/theme/dracula.css';
import 'NODE/codemirror/theme/duotone-dark.css';
import 'NODE/codemirror/theme/duotone-light.css';
import 'NODE/codemirror/theme/eclipse.css';
import 'NODE/codemirror/theme/elegant.css';
import 'NODE/codemirror/theme/erlang-dark.css';
import 'NODE/codemirror/theme/gruvbox-dark.css';
import 'NODE/codemirror/theme/hopscotch.css';
import 'NODE/codemirror/theme/icecoder.css';
import 'NODE/codemirror/theme/idea.css';
import 'NODE/codemirror/theme/isotope.css';
import 'NODE/codemirror/theme/lesser-dark.css';
import 'NODE/codemirror/theme/liquibyte.css';
import 'NODE/codemirror/theme/lucario.css';
import 'NODE/codemirror/theme/material-darker.css';
import 'NODE/codemirror/theme/material-ocean.css';
import 'NODE/codemirror/theme/material-palenight.css';
import 'NODE/codemirror/theme/material.css';
import 'NODE/codemirror/theme/mbo.css';
import 'NODE/codemirror/theme/mdn-like.css';
import 'NODE/codemirror/theme/midnight.css';
import 'NODE/codemirror/theme/monokai.css';
import 'NODE/codemirror/theme/moxer.css';
import 'NODE/codemirror/theme/neat.css';
import 'NODE/codemirror/theme/neo.css';
import 'NODE/codemirror/theme/night.css';
import 'NODE/codemirror/theme/nord.css';
import 'NODE/codemirror/theme/oceanic-next.css';
import 'NODE/codemirror/theme/panda-syntax.css';
import 'NODE/codemirror/theme/paraiso-dark.css';
import 'NODE/codemirror/theme/paraiso-light.css';
import 'NODE/codemirror/theme/pastel-on-dark.css';
import 'NODE/codemirror/theme/railscasts.css';
import 'NODE/codemirror/theme/rubyblue.css';
import 'NODE/codemirror/theme/seti.css';
import 'NODE/codemirror/theme/shadowfox.css';
import 'NODE/codemirror/theme/solarized.css';
import 'NODE/codemirror/theme/ssms.css';
import 'NODE/codemirror/theme/the-matrix.css';
import 'NODE/codemirror/theme/tomorrow-night-bright.css';
import 'NODE/codemirror/theme/tomorrow-night-eighties.css';
import 'NODE/codemirror/theme/ttcn.css';
import 'NODE/codemirror/theme/twilight.css';
import 'NODE/codemirror/theme/vibrant-ink.css';
import 'NODE/codemirror/theme/xq-dark.css';
import 'NODE/codemirror/theme/xq-light.css';
import 'NODE/codemirror/theme/yeti.css';
import 'NODE/codemirror/theme/yonce.css';
import 'NODE/codemirror/theme/zenburn.css';

import 'NODE/codemirror/lib/codemirror.css';
import 'NODE/codemirror/addon/display/fullscreen.css';

// import CodeMirror from 'NODE/codemirror/lib/codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { basicSetup, EditorView } from '@codemirror/basic-setup';
// import { language } from "@codemirror/language"

import { cpp } from '@codemirror/lang-cpp';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { lezer } from '@codemirror/lang-lezer';
import { markdown } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import { rust } from '@codemirror/lang-rust';
import { sql } from '@codemirror/lang-sql';
import { xml } from '@codemirror/lang-xml';

// Not sure how to use these
import { GFM, Emoji } from 'NODE/lezer-markdown/src/index';

const state = EditorState.create({
    extensions: [
        basicSetup,
        (new Compartment()).of(EditorView.lineWrapping),
        (new Compartment()).of(cpp()),
        (new Compartment()).of(css()),
        (new Compartment()).of(html()),
        (new Compartment()).of(java()),
        (new Compartment()).of(javascript({jsx: true, typescript: true})),
        (new Compartment()).of(json()),
        (new Compartment()).of(python()),
        (new Compartment()).of(rust()),
        (new Compartment()).of(sql()),
        (new Compartment()).of(xml()),
        (new Compartment()).of(lezer()),
        (new Compartment()).of(markdown()),
        // EditorView.updateListener.of(({ docChanged, state }) => {
        //     const editable = (new Compartment()).get(state);

        //     if (
        //         state.facet(editable.facet)
        //     ) {
        //         handler(state.doc.toJSON().join(state.lineBreak))
        //     }
        // })
    ],
});

function createChangeListener(handler: CallableFunction): EditorState {
    return EditorState.create({
        extensions: [
            EditorView.updateListener.of(({ docChanged, state }) => {
                const editable = (new Compartment()).get(state);

                if (editable !== undefined && docChanged) {
                    handler(state.doc.toJSON().join(state.lineBreak));
                }
            })
        ],
    });
}

function init(element: HTMLElement): EditorView {
    const view = new EditorView({
        state,
        parent: element,
    });
    return view;
}

function posToOffset(state: EditorState, pos: CmPosition) {
    return state.doc.line(pos.line + 1).from + pos.ch;
}

function offsetToPos(state: EditorState, offset: number): CmPosition {
    let line = state.doc.lineAt(offset);
    return { line: line.number - 1, ch: offset - line.from };
}

interface CmPosition {
    line: number, // line.number - 1
    ch: number, // offset - line.from
}

export { EditorView, init, posToOffset, offsetToPos, createChangeListener };
