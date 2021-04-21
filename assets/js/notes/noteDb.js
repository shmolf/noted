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
    return db.open().then((dbInstance) => {
      try {
        noteTable = dbInstance.table(TABLE_NOTE);
        resolve(dbInstance);
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
  return new Promise((resolve, reject) => {
    if ('uuid' in note) {
      getRecord(note.uuid).then((record) => {
        if (record !== undefined) {
          record.modify(note).then((index) => resolve(index));
        } else {
          reject(Error(`Could not find a record by UUID: '${note.uuid}'`));
        }
      }).catch((reason) => {
        reject(reason);
      });
    } else {
      getTable()
        .then((table) => {
          table.add({
            title: note.title || '',
            content: note.content || '',
            tags: note.tags || [],
            action: note.action,
            opened: true,
            synced: false,
          });
        })
        .then(() => resolve())
        .catch((reason) => {
          reject(reason);
        });
    }
  });
}

/**
 * @param {string} uuid
 * @returns {Promise<Dexie.Collection<any,any>>|undefined}
 */
async function getRecord(uuid) {
  return new Promise((resolve, reject) => {
    getTable()
      .then((table) => resolve(table.where('noteUuid').equals(uuid)))
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * Gets the Notes Table
 *
 * @returns {Promise<Dexie.Table>}
 */
async function getTable() {
  return new Promise((resolve, reject) => {
    if (noteTable !== null) {
      resolve(noteTable);
    } else {
      reject(Error(`Could not load the table: '${TABLE_NOTE}'`));
    }
  });
}

function packet(action, data) {
  return JSON.stringify({
    action,
    data,
  });
}

export default {
  buildDb,
  getRecord,
  modifyRecord,
  packet,
};
