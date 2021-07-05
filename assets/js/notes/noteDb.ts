import Dexie from 'NODE/dexie/dist/dexie';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line import/extensions
import { Note, NotePackage } from './worker-client-api';

const DB_NAME = 'noted-notes';
const db = new Dexie(DB_NAME);

export const TABLE_NOTE = 'notes';
export const NOTE_ACTIONS = Object.freeze({ update: 'update', delete: 'delete' });

export interface DexieNote extends Note {
    id?: number;
    clientUuid: string|null;
    title: string;
    content: string;
    tags: string[];
    inTrashcan: boolean;
    isDeleted: boolean;
    createdDate: Date|null;
    lastModified: Date|null;
}

let noteTable: Dexie.Table<DexieNote>|null = null;

const schema = {
  id: 'id',
  clientUuid: 'clientUuid',
  title: 'title',
  content: 'content',
  tags: 'tags',
  syncAction: 'syncAction',
  inTrashcan: 'inTrashcan',
  isDeleted: 'isDeleted',
};

/**
 * Initializes the various versions of the databases.
 */
function buildDb(): Promise<Dexie> {
  return new Promise((resolve, reject) => {
    db.version(1).stores({
      // 'opened' do not need to be indexed, so omit from schema
      notes: '++id, &clientUuid, title, content, *tags, lastSynced',
    });
    db.version(2).stores({
      // No change in indexes
      notes: '++id, &clientUuid, title, content, *tags, lastSynced',
    }).upgrade((transactions) => {
      // Since the property id dynamic. Might needs to create a custom interface
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      transactions.notes.toCollection().modify((note) => { delete note.opened; delete note.synced; });
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
 * @param note
 */
function modifyRecord(note: NotePackage): Promise<string> {
  return new Promise((resolve, reject) => {
    const uuid = String(note.clientUuid ?? '').length === 0 ? null : (note.clientUuid as string).trim();

    if (uuid === null) {
      // `ClientUUID` is being 🔪, so for now, ignore the error
      // eslint-disable-next-line no-shadow
      createNewRecord(note).then((uuid) => resolve(uuid));
    } else {
      getRecordByClientUuid(uuid)
        .then((records) => {
          records.toArray()
            .then((arr) => {
              if (arr.length === 0) {
                throw new Error(`Could not find a record by Uuid: '${uuid}'`);
              } else {
                records.modify(note.toObj()).then(() => resolve(uuid));
              }
            })
            .catch(() => {
              createNewRecord(note)
                .then((newUuid) => resolve(newUuid))
                .catch((response) => reject(response));
            });
        })
        .catch((reason) => reject(reason));
    }
  });
}

/**
 * @param note
 */
function createNewRecord(note: Note): Promise<string> {
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
            inTrashcan: false,
            isDeleted: false,
            createdDate: null,
            lastModified: null,
          })
          .then(() => resolve(uuid));
      })
      .catch((reason) => reject(reason));
  });
}

/**
 * @param notes
 */
function syncRecords(notes: NotePackage[]) {
  // Need to do a bulk update using Dexie.
}

/**
 * @param uuid
 */
function getRecordByClientUuid(uuid: string): Promise<Dexie.Collection<DexieNote, any>> {
  return new Promise((resolve, reject) => {
    getTable()
      .then((table) => table.where(schema.clientUuid).equals(uuid))
      .then((records) => resolve(records))
      .catch((reason) => reject(reason));
  });
}

/**
 * @param uuid
 */
function delRecordByClientUuid(uuid: string): Promise<void|null> {
  return new Promise((resolve, reject) => {
    if (uuid.trim().length === 0) {
      resolve(null);
    }

    getTable()
      .then((table) => ({ table, records: table.where(schema.clientUuid).equals(uuid) }))
      .then((data) => {
        const { table, records } = data;
        records.toArray()
          .then((arr) => table.delete(arr[0].id))
          .then(() => resolve(null))
          .catch((reason) => reject(reason));
      })
      .catch((reason) => reject(reason));
  });
}

/**
 * @param id
 */
function getRecordById(id: number): Promise<Dexie.Collection<any, any>> {
  return new Promise((resolve, reject) => {
    if (typeof id !== 'number' || id <= 0) {
      throw Error(`Could note retrieve record by Id: '${id}'`);
    }

    getTable()
      .then((table) => table.where(schema.id).equals(id))
      .then((records) => resolve(records))
      .catch((reason) => reject(reason));
  });
}

/**
 *
 */
function getTable(): Promise<Dexie.Table<DexieNote>> {
  return new Promise((resolve, reject) => {
    if (noteTable !== null) {
      resolve(noteTable);
    } else {
      reject(Error(`Could not load the table: '${TABLE_NOTE}'`));
    }
  });
}

/**
 * @param action
 * @param data
 */
function packet(action: any, data: any) {
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
