import Dexie from 'NODE/dexie/dist/dexie';

const DB_NAME = 'noted-notes';
const TABLE_NOTE = 'notes';
const db = new Dexie(DB_NAME);

/**
 * Initializes the various versions of the databases.
 */
function buildDb() {
  db.version(1).stores({
    notes: '++id, &noteUuid, title, content, *tags, action, opened, synced',
  });
}

/**
 * @typedef {Object} ModifyNote
 * @property {string} [uuid]
 * @property {string} [title]
 * @property {string} [content]
 * @property {string[]} [tags]
 * @property {'update'|'delete'} action
 */

/**
 * @param {ModifyNote} note
 */
async function modifyRecord(note) {
  if ('uuid' in note) {
    await getRecord(note.uuid).then((record) => record.modify(note));
  } else {
    await getTable().add({
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
 * @returns {Promise<Dexie.Collection<any,any>>}
 */
async function getRecord(uuid) {
  return getTable()
    .where('noteUuid').equals(uuid);
}

/**
 * Gets the Notes Table
 *
 * @returns {Dexie.Table}
 */
function getTable() {
  return db.table('fake');// .table(TABLE_NOTE);
}

export default {
  buildDb,
  getRecord,
  modifyRecord,
};
