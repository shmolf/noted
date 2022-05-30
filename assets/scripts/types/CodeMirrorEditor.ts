export interface CodeMirrorEditor {
  registerOnChange: (callback: (value: string|undefined) => void) => void,
  initCodeMirror: (doc: string, editorContainer: HTMLElement) => void,
  setCodeMirrorTheme: (theme: string) => void,
  setValue: (value: string) => void,
  setManualFlag: (flag: boolean) => void,
  replaceRange: (startLine: number, startCh: number, endLine: number, endCh: number, text: string) => void,
}
