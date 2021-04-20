import Dexie from 'NODE/dexie/dist/dexie';

const DB_NAME = 'noted-notes';
const db = new Dexie(DB_NAME);
export const TABLE_NOTE = 'notes';
/** @enum {string} */
export const NOTE_ACTIONS = Object.freeze({ update: 'update', delete: 'delete' });

/** @type {Dexie.Table|null} */
let noteTable = null;

/**
 * Initializes the various versions of the databases.
 *
 * @returns {Promise<Dexie>}
 */
async function buildDb() {
  return new Promise((resolve, reject) => {
    db.version(1).stores({
      // 'action' and 'opened' do not need to be indexed, so omit from schema
      notes: '++id, &noteUuid, title, content, *tags, synced',
    });
    return db.open().then((db) => {
      try {
        noteTable = db.table(TABLE_NOTE);
        resolve(db);
      } catch (/** @type {import('dexie').InvalidTableError} */error) {
        console.error(`${error.name}: ${error.message}`);
        reject(error);
      }
    });
  });
}

/**
 * @typedef {Object} ModifyNote
 * @property {string} [uuid]
 * @property {string} [title]
 * @property {string} [content]
 * @property {string[]} [tags]
 * @property {NOTE_ACTIONS} action
 */

/**
 * @param {ModifyNote} note
 */
async function modifyRecord(note) {
  console.log(note);
  if ('uuid' in note) {
    await getRecord(note.uuid).then((record) => record !== undefined ? record.modify(note) : null);
  } else {
    await getTable()?.add({
      title: note.title || '',
      content: note.content || '',
      tags: note.tags || [],
      action: note.action,
      opened: true,
      synced: false,
    });
  }
}

/**
 * @param {string} uuid
 * @returns {Promise<Dexie.Collection<any,any>>|undefined}
 */
async function getRecord(uuid) {
  return getTable()
    ?.where('noteUuid').equals(uuid);
}

/**
 * Gets the Notes Table
 *
 * @returns {Dexie.Table}
 */
function getTable() {
  return noteTable;
}

export default {
  buildDb,
  getRecord,
  modifyRecord,
};
