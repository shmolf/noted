import Dexie from 'NODE/dexie/dist/dexie';
import { v4 as uuidv4 } from 'uuid';
import { NotePackage } from './worker-client-api';

const DB_NAME = 'noted-notes';
const db = new Dexie(DB_NAME);
export const TABLE_NOTE = 'notes';
/** @enum {string} */
export const NOTE_ACTIONS = Object.freeze({ update: 'update', delete: 'delete' });

/** @typedef {import('./worker-client-api').NotePackageOptions} NotePackageOptions */

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
  inTrashcan: 'inTrashcan',
};

/**
 * Initializes the various versions of the databases.
 *
 * @returns {Promise<Dexie>}
 */
async function buildDb() {
  return new Promise((resolve, reject) => {
    db.version(1).stores({
      // 'opened' do not need to be indexed, so omit from schema
      notes: '++id, &noteUuid, &clientUuid, title, content, *tags, synced',
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
 * @param {NotePackage} note
 * @returns {Promise<number>}
 */
function modifyRecord(note) {
  return new Promise((resolve, reject) => {
    if (typeof note.noteUuid === 'string') {
      getRecordByNoteUuid(note.noteUuid).then((record) => {
        record?.modify(note.toObj()).then((id) => resolve(id))
          ?? reject(Error(`Could not find a record by UUID: '${note.noteUuid}'`));
      }).catch((reason) => {
        reject(reason);
      });
    } else if (typeof note.clientUuid === 'string') {
      getRecordByClientUuid(note.clientUuid).then((record) => {
        record?.modify(note.toObj()).then((id) => resolve(id))
          ?? reject(Error(`Could not find a record by UUID: '${note.clientUuid}'`));
      }).catch((reason) => {
        reject(reason);
      });
    } else if (typeof note.id === 'number') {
      getRecordById(note.id).then((record) => {
        record?.modify(note.toObj()).then((id) => resolve(id))
          ?? reject(Error(`Could not find a record by Id: '${note.id}'`));
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
              clientUuid: uuidv4(),
              opened: true,
              synced: false,
              inTrashcan: false,
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
 * @returns {Promise<?NotePackage>}
 */
function getRecordByNoteUuid(uuid) {
  return new Promise((resolve, reject) => {
    if (uuid.trim().length === 0) {
      resolve(null);
    }

    getTable()
      .then((table) => table.where(schema.noteUuid).equals(uuid).first())
      .then((/** @type {NotePackageOptions} */record) => resolve(new NotePackage(record)))
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {string} uuid
 * @returns {Promise<?NotePackage>}
 */
function getRecordByClientUuid(uuid) {
  return new Promise((resolve, reject) => {
    if (uuid.trim().length === 0) {
      resolve(null);
    }

    getTable()
      .then((table) => table.where(schema.clientUuid).equals(uuid).first())
      .then((/** @type {NotePackageOptions} */record) => resolve(new NotePackage(record)))
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {number} id
 * @returns {Promise<?NotePackage>}
 */
function getRecordById(id) {
  return new Promise((resolve, reject) => {
    if (typeof id !== 'number' || id <= 0) {
      throw Error(`Could note retrieve record by Id: '${id}'`);
    }

    getTable()
      .then((table) => table.where(schema.id).equals(id).first())
      .then((/** @type {NotePackageOptions} */record) => resolve(new NotePackage(record)))
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
  getRecordByNoteUuid,
  getRecordByClientUuid,
  getRecordById,
  modifyRecord,
  packet,
};
