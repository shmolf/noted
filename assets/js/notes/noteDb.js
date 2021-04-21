import Dexie from 'NODE/dexie/dist/dexie';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'noted-notes';
const db = new Dexie(DB_NAME);
export const TABLE_NOTE = 'notes';
/** @enum {string} */
export const NOTE_ACTIONS = Object.freeze({ update: 'update', delete: 'delete' });

/** @type {Dexie.Table|null} */
let noteTable = null;

const schema = {
  id: 'id',
  noteUuid: 'noteUuid',
  clientUuid: 'clientUuid',
  title: 'title',
  content: 'content',
  tags: 'tags',
  opened: 'opened',
  synced: 'synced',
  syncAction: 'syncAction',
};

/**
 * Initializes the various versions of the databases.
 *
 * @returns {Promise<Dexie>}
 */
async function buildDb() {
  return new Promise((resolve, reject) => {
    db.version(2).stores({// V2, added the 'clientUuid' index
      // 'action' and 'opened' do not need to be indexed, so omit from schema
      notes: '++id, &noteUuid, &clientUuid, title, content, *tags, synced',
    }).upgrade(tx => { // Never remove an 'upgrade' function. V2 + upgrade will forver exist.
      return tx.table(TABLE_NOTE).toCollection().modify(note => {
          // Add a Client-side UUID to each note
          note.uuid = uuidv4();
      });
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
 * @property {number} [id]
 * @property {string} [uuid]
 * @property {string} [clientUuid]
 * @property {string} [title]
 * @property {string} [content]
 * @property {string[]} [tags]
 * @property {NOTE_ACTIONS} action
 */

/**
 * @param {ModifyNote} note
 * @returns {Promise<number>}
 */
function modifyRecord(note) {
  return new Promise((resolve, reject) => {
    if ('uuid' in note) {
      getRecordByUuid(note.uuid).then((record) => {
        record?.modify(note).then((id) => resolve(id))
          ?? reject(Error(`Could not find a record by UUID: '${note.uuid}'`));
      }).catch((reason) => {
        reject(reason);
      });
    } else if ('id' in note) {
      getRecordById(note.id).then((record) => {
        record?.modify(note).then((id) => resolve(id))
          ?? reject(Error(`Could not find a record by UUID: '${note.uuid}'`));
      }).catch((reason) => {
        reject(reason);
      });
    } else {
      getTable()
        .then((table) => {
          table
            .add({
              title: note.title || '',
              content: note.content || '',
              tags: note.tags || [],
              clientUuid: note.clientUuid,
              action: note.action,
              opened: true,
              synced: false,
            })
            .then((id) => resolve(id));
        })
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
function getRecordByUuid(uuid) {
  return new Promise((resolve, reject) => {
    getTable()
      .then((table) => resolve(table.where(schema.clientUuid).equals(uuid)))
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {number} id
 * @returns {Promise<Dexie.Collection<any,any>>|undefined}
 */
function getRecordById(id) {
  return new Promise((resolve, reject) => {
    getTable()
      .then((table) => resolve(table.where(schema.id).equals(id)))
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
function getTable() {
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
  getRecordByUuid,
  getRecordById,
  modifyRecord,
  packet,
};
