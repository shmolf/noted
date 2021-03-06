/* eslint-disable */

import { CodeMirrorEditor } from 'SCRIPTS/types/CodeMirrorEditor';
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  lineNumbers,
  highlightActiveLineGutter,
  EditorView,
  ViewUpdate,
  ViewPlugin,
} from '@codemirror/view';
import { Extension, EditorState, Text } from '@codemirror/state';
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from '@codemirror/language';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
} from '@codemirror/autocomplete';
import { lintKeymap } from '@codemirror/lint';
import { javascript } from "@codemirror/lang-javascript";

/// This is an extension value that just pulls together a number of
/// extensions that you might want in a basic editor. It is meant as a
/// convenient helper to quickly set up CodeMirror without installing
/// and importing a lot of separate packages.
///
/// Specifically, it includes...
///
///  - [the default command bindings](#commands.defaultKeymap)
///  - [line numbers](#view.lineNumbers)
///  - [special character highlighting](#view.highlightSpecialChars)
///  - [the undo history](#commands.history)
///  - [a fold gutter](#language.foldGutter)
///  - [custom selection drawing](#view.drawSelection)
///  - [drop cursor](#view.dropCursor)
///  - [multiple selections](#state.EditorState^allowMultipleSelections)
///  - [reindentation on input](#language.indentOnInput)
///  - [the default highlight style](#language.defaultHighlightStyle) (as fallback)
///  - [bracket matching](#language.bracketMatching)
///  - [bracket closing](#autocomplete.closeBrackets)
///  - [autocompletion](#autocomplete.autocompletion)
///  - [rectangular selection](#view.rectangularSelection) and [crosshair cursor](#view.crosshairCursor)
///  - [active line highlighting](#view.highlightActiveLine)
///  - [active line gutter highlighting](#view.highlightActiveLineGutter)
///  - [selection match highlighting](#search.highlightSelectionMatches)
///  - [search](#search.searchKeymap)
///  - [linting](#lint.lintKeymap)
///
/// (You'll probably want to add some language package to your setup
/// too.)
///
/// This package does not allow customization. The idea is that, once
/// you decide you want to configure your editor more precisely, you
/// take this package's source (which is just a bunch of imports and
/// an array literal), copy it into your own code, and adjust it as
/// desired.
const basicSetup: Extension = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(
    defaultHighlightStyle,
    { fallback: true },
  ),
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  crosshairCursor(),
  highlightActiveLine(),
  highlightSelectionMatches(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    ...lintKeymap,
  ]),
];

let cmEditor: EditorView;

function initCodeMirror(doc: string, parent: HTMLElement): void {
  cmEditor = new EditorView({
    state: EditorState.create({
      doc: Text.of([doc]),
      extensions: [
        basicSetup,
        javascript({ jsx: true, typescript: true }),
        changeResponse(() => {})
      ],
    }),
    parent,
  });
  console.log({
    doc,
    cmEditor,
    parent,
  });
}

function registerOnChange(onChange: (value: string|undefined) => void): void {
  // Needs Logic
  // cm6Editor.on('update', (update: ViewUpdate) => {
  //   console.log(update.state.doc.toString());
  // });
}

function setCodeMirrorTheme(theme: string) {
  // Needs Logic
}

function setValue(value: string) {
  // Needs Logic
}

function setManualFlag(flag: boolean) {
  // Needs Logic
}

function replaceRange(startLine: number, startCh: number, endLine: number, endCh: number, text: string) {
  // Needs Logic
}


const methods: CodeMirrorEditor = {
  registerOnChange,
  initCodeMirror,
  setCodeMirrorTheme,
  setValue,
  setManualFlag,
  replaceRange,
};

export default methods;

function changeResponse(callback: (value: string|undefined) => void) {
  const plugin = ViewPlugin.fromClass(class {
    constructor(private view: EditorView) {}

    update(update: ViewUpdate) {
      if (update.docChanged) {
        console.log({
          update,
        });
      }
    }

    destroy() {}
  });

  return [plugin];
}
