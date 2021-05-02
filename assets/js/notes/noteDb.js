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
  clientUuid: 'clientUuid',
  title: 'title',
  content: 'content',
  tags: 'tags',
  opened: 'opened',
  synced: 'synced',
  syncAction: 'syncAction',
  inTrashcan: 'inTrashcan',
  isDeleted: 'isDeleted',
};

/**
 * Initializes the various versions of the databases.
 *
 * @returns {Promise<Dexie>}
 */
function buildDb() {
  return new Promise((resolve, reject) => {
    db.version(1).stores({
      // 'opened' do not need to be indexed, so omit from schema
      notes: '++id, &clientUuid, title, content, *tags, lastSynced',
    });

    return db.open()
      .then((dbInstance) => {
        noteTable = dbInstance.table(TABLE_NOTE);
        resolve(dbInstance);
      })
      .catch((error) => reject(error));
  });
}

/**
 * @param {NotePackage} note
 * @returns {Promise<string>}
 */
function modifyRecord(note) {
  return new Promise((resolve, reject) => {
    if (note.id === null && note.clientUuid === null) {
      createNewRecord(note).then((uuid) => resolve(uuid));
    } else {
      getRecordByClientUuid(note.clientUuid)
        .then((records) => {
          records.toArray()
            .then((arr) => {
              if (arr.length === 0) {
                const identifierType = typeof note.clientUuid === 'string' ? 'Uuid' : 'Id';
                const identifierVal = typeof note.clientUuid === 'string' ? note.clientUuid : note.id;
                throw new Error(`Could not find a record by ${identifierType}: '${identifierVal}'`);
              } else {
                records.modify(note.toObj()).then(() => resolve(note.clientUuid));
              }
            })
            .catch((reason) => {
              console.warn(`${reason}\nGoing to try creating a new record.`);
              createNewRecord(note)
                .then((uuid) => resolve(uuid))
                .catch((response) => reject(response));
            });
        })
        .catch((reason) => reject(reason));
    }
  });
}

/**
 * @param {NotePackage} note
 * @returns {Promise<string>}
 */
function createNewRecord(note) {
  return new Promise((resolve, reject) => {
    getTable()
      .then((table) => {
        const uuid = note.clientUuid ?? uuidv4();
        table
          .add({
            title: note.title || '',
            content: note.content || '',
            tags: note.tags || [],
            clientUuid: uuid,
            opened: true,
            synced: false,
            inTrashcan: false,
            isDeleted: false,
          }).then(() => resolve(uuid));
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {NotePackage[]} notes
 * @returns void
 */
function syncRecords(notes) {
  // Need to do a bulk update using Dexie.
}

/**
 * @param {string} uuid
 * @returns {Promise<?Dexie.Collection<any, any>>}
 */
function getRecordByClientUuid(uuid) {
  return new Promise((resolve, reject) => {
    if (uuid.trim().length === 0) {
      resolve(null);
    }

    getTable()
      .then((table) => table.where(schema.clientUuid).equals(uuid))
      .then((records) => resolve(records))
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {string} uuid
 * @returns {Promise<?Dexie.Collection<any, any>>}
 */
function delRecordByClientUuid(uuid) {
  return new Promise((resolve, reject) => {
    if (uuid.trim().length === 0) {
      resolve(null);
    }

    getTable()
      .then((table) => {
        return { 'table': table, 'records': table.where(schema.clientUuid).equals(uuid) };
      })
      .then((data) => {
        const { table, records } = data;
        return records.toArray().then((arr) => table.delete(arr[0].id));
      })
      .catch((reason) => {
        reject(reason);
      });
  });
}

/**
 * @param {number} id
 * @returns {Promise<?Dexie.Collection<any, any>>}
 */
function getRecordById(id) {
  return new Promise((resolve, reject) => {
    if (typeof id !== 'number' || id <= 0) {
      throw Error(`Could note retrieve record by Id: '${id}'`);
    }

    getTable()
      .then((table) => table.where(schema.id).equals(id))
      .then((records) => resolve(records))
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
  getRecordByClientUuid,
  delRecordByClientUuid,
  getRecordById,
  modifyRecord,
  syncRecords,
  packet,
};
