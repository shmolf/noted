export const clientActions = Object.freeze({
  GET_LIST: {
    k: 'getNoteList',
    /**
     * @returns {string}
     */
    f: () => packAction(clientActions.GET_LIST.k),
  },
  MODIFY: {
    k: 'modify',
    /**
     * @param {NotePackage} note
     * @returns {string}
     */
    f: (note) => packAction(clientActions.MODIFY.k, note),
  },
  RECYCLE: {
    k: 'recycle',
    /**
     * @param {string} noteUuid
     * @returns {string}
     */
    f: (noteUuid) => packAction(clientActions.RECYCLE.k, noteUuid),
  },
  GET_BY_CLIENTUUID: {
    k: 'retrieveByUuid',
    /**
     * @param {string} clientUuid
     * @returns {string}
     */
    f: (clientUuid) => packAction(clientActions.GET_BY_CLIENTUUID.k, clientUuid),
  },
});

export const workerStates = Object.freeze({
  TEST: {
    k: 'test',
    f: () => packState(workerStates.TEST.k),
  },
  TEST_READY: {
    k: 'test-ready',
    f: () => packState(workerStates.TEST_READY.k),
  },
  READY: {
    k: 'ready',
    f: () => packState(workerStates.READY.k),
  },
  NOTE_LIST: {
    k: 'note-list',
    /**
     * @param {array} list
     * @returns {string}
     */
    f: (list) => packState(workerStates.NOTE_LIST.k, list),
  },
  NOTE_DATA: {
    k: 'note-data',
    /**
     * @param {NotePackage} note
     * @returns {string}
     */
    f: (note) => packState(workerStates.NOTE_DATA.k, note),
  },
  UPD8_COMP: {
    k: 'note-updated',
    /**
     * @param {any} response
     * @returns {string}
     */
    f: (response) => packState(workerStates.UPD8_COMP.k, response),
  },
});

/**
 * Packages an action and data, into a transmittible object-string
 *
 * @param {string} action
 * @param {Object} data
 * @returns {string}
 */
function packAction(action, data) {
  return stringIt({ action, data });
}

/**
 * Packages an action and data, into a transmittible object-string
 *
 * @param {string} state
 * @param {any} data
 * @returns {string}
 */
function packState(state, data) {
  return stringIt({ action: state, data });
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
