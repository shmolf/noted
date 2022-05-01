import CodeMirror from 'codemirror';
// eslint-disable-next-line import/extensions
import CM from './code-mirror-assets';

// Since CodeMirror.setValue() triggers a change event, we'll want to prevent change events when manually setting value
let manuallySettingValue = false;
let codeMirrorEditor: CodeMirror.Editor;

let onChange:(value: string|undefined) => void;

export function registerOnChange(callback: (value: string|undefined) => void): void {
  onChange = callback;
}

/**
 * Initialized the CodeMirror library
 */
export function initCodeMirror($editor: JQuery<HTMLElement>): void {
  /** @see https://codemirror.net/doc/manual.html#config */
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
    theme: 'default',
    tabindex: 0,
  };

  codeMirrorEditor = CM.fromTextArea($editor.get(0), cmOptions);

  codeMirrorEditor.on('change', (editor) => {
    if (manuallySettingValue) return;

    onChange(editor.getValue());
  });
}

export function setCodeMirrorTheme(theme: string): void {
  codeMirrorEditor.setOption('theme', theme);
  codeMirrorEditor.refresh();
}

export function setValue(value: string): void {
  manuallySettingValue = true;
  codeMirrorEditor.setValue(value);
  manuallySettingValue = false;
}

export function setManualFlag(flag: boolean): void {
  manuallySettingValue = flag;
}

export function replaceRange(startLine: number, startCh: number, endLine: number, endCh: number, text: string): void {
  codeMirrorEditor.replaceRange(
    text,
    { line: startLine, ch: startCh },
    { line: endLine, ch: endCh },
  );
}
