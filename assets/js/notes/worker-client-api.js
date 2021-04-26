export const clientActions = Object.freeze({
  GET_LIST: {
    k: 'getNoteList',
    /**
     * @returns {string}
     */
    f: () => packIt(clientActions.GET_LIST.k),
  },
  MODIFY: {
    k: 'modify',
    /**
     * @param {NotePackage} note
     * @returns {string}
     */
    f: (note) => packIt(clientActions.MODIFY.k, note),
  },
  RECYCLE: {
    k: 'recycle',
    /**
     * @param {string} noteUuid
     * @returns {string}
     */
    f: (noteUuid) => packIt(clientActions.RECYCLE.k, noteUuid),
  },
  GET_BY_CLIENTUUID: {
    k: 'retrieveByUuid',
    /**
     * @param {string} clientUuid
     * @returns {string}
     */
    f: (clientUuid) => packIt(clientActions.GET_BY_CLIENTUUID.k, clientUuid),
  },
});

export const workerStates = Object.freeze({
  TEST: 'test',
  TEST_READY: 'test-ready',
  READY: 'ready',
  NOTE_LIST: 'note-list',
  NOTE_DATA: 'note-data',
  UPD8_COMP: 'note-updated',
});

/**
 * Packages an action and data, into a transmittible object-string
 *
 * @param {string} action
 * @param {Object} data
 * @returns {string}
 */
function packIt(action, data) {
  return stringIt({ action, data });
}

/**
 * Json Stringifies an object
 *
 * @param {Object} obj
 * @returns {string}
 */
function stringIt(obj) {
  return JSON.stringify(obj);
}

/**
 * @typedef {object} NotePackageOptions
 * @property {string} [id]
 * @property {string} [noteUuid]
 * @property {string} [clientUuid]
 * @property {string} title
 * @property {string} content
 * @property {string[]} tags
 * @property {boolean} [inTrashcan=false]
 */
export class NotePackage {
  /**
   * @param {NotePackageOptions} optionalProperties
   */
  constructor(optionalProperties) {
    this.id = optionalProperties.id ?? null;
    this.noteUuid = optionalProperties.noteUuid?.trim() ?? null;
    this.clientUuid = optionalProperties.clientUuid?.trim() ?? null;
    this.title = optionalProperties.title.trim();
    this.content = optionalProperties.content;
    this.tags = optionalProperties.tags.filter((value, index, self) => self.indexOf(value) === index);
    this.inTrashcan = optionalProperties.inTrashcan ?? false;

    // const id = 'id' in optionalProperties ? Number(optionalProperties.id) : null;
    // // Second layer check, in case `id === 0`
    // this.id = id ?? null;
    // const noteUuid = ('noteUuid' in optionalProperties ? optionalProperties.noteUuid : '').trim();
    // // Second layer check, in case `noteUuid` is an empty string
    // this.noteUuid = noteUuid ?? null;
    // const clientUuid = ('clientUuid' in optionalProperties ? optionalProperties.clientUuid : '').trim();
    // // Second layer check, in case `clientUuid` is an empty string
    // this.clientUuid = clientUuid ?? null;
    // this.title = optionalProperties.title.trim();
    // this.content = optionalProperties.content;
    // this.tags = 'tags' in optionalProperties ? optionalProperties.tags : [];
  }

  /**
   * @returns {NotePackageOptions}
   */
  toObj() {
    return {
      id: this.id,
      noteUuid: this.noteUuid,
      clientUuid: this.clientUuid,
      title: this.title,
      content: this.content,
      tags: this.tags,
      inTrashcan: this.inTrashcan,
    };
  }
}
