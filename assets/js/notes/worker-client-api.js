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
     * @param {string} uuid
     * @returns {string}
     */
    f: (uuid) => packAction(clientActions.RECYCLE.k, uuid),
  },
  GET_BY_CLIENTUUID: {
    k: 'retrieveByUuid',
    /**
     * @param {string} clientUuid
     * @returns {string}
     */
    f: (clientUuid) => packAction(clientActions.GET_BY_CLIENTUUID.k, clientUuid),
  },
  DEL_BY_CLIENTUUID: {
    k: 'deleteByUuid',
    /**
     * @param {string} clientUuid
     * @returns {string}
     */
    f: (clientUuid) => packAction(clientActions.DEL_BY_CLIENTUUID.k, clientUuid),
  },
  EXPORT_NOTES: {
    k: 'exportNotes',
    /**
     * @returns {string}
     */
    f: () => packAction(clientActions.EXPORT_NOTES.k),
  }
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
  DEL_COMP: {
    k: 'note-deleted',
    /**
     * @param {string} uuid
     * @returns {string}
     */
    f: (uuid) => packState(workerStates.DEL_COMP.k, uuid),
  },
  EXPORT_DATA: {
    k: 'export-data',
    /**
     * @param {NotePackage[]} notes
     * @returns {string}
     */
    f: (notes) => packState(workerStates.EXPORT_DATA.k, notes),
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
  return stringIt({ state, data });
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
 * @property {number} [id]
 * @property {string} [clientUuid]
 * @property {string} title
 * @property {string} content
 * @property {string[]} tags
 * @property {boolean} [inTrashcan=false]
 * @property {boolean} [isDeleted=false]
 * @property {?Date} [createdDate]
 * @property {?Date} [lastModified]
 */
export class NotePackage {
  /**
   * @param {NotePackageOptions} optionalProperties
   */
  constructor(optionalProperties) {
    this.id = optionalProperties.id ?? null;
    this.clientUuid = optionalProperties.clientUuid?.trim() || null;
    this.title = optionalProperties.title.trim();
    this.content = optionalProperties.content;
    this.tags = optionalProperties.tags.filter((value, index, self) => self.indexOf(value) === index);
    this.inTrashcan = optionalProperties.inTrashcan ?? false;
    this.isDeleted = optionalProperties.isDeleted ?? false;
    this.createdDate = optionalProperties.createdDate ?? null;
    this.lastModified = optionalProperties.lastModified ?? null;
  }

  /**
   * @returns {NotePackageOptions}
   */
  toObj() {
    const noteObj = {
      id: this.id,
      clientUuid: this.clientUuid,
      title: this.title,
      content: this.content,
      tags: this.tags,
      inTrashcan: this.inTrashcan,
    };

    // let's trim any null properties
    Object.keys(noteObj).forEach((key) => {
      if (noteObj[key] === null) {
        delete noteObj[key];
      }
    });

    return noteObj;
  }
}