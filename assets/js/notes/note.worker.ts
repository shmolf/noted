import noteDb from 'JS/notes/noteDb';
import {
  workerStates, clientActions, NotePackage, Note,
} from 'JS/notes/worker-client-api';
import axios from 'axios';
import { MapStringTo } from 'JS/types/Generic';

// eslint-disable-next-line no-restricted-globals
const worker:Worker = self as any;

(() => {
  noteDb.buildDb().then(() => worker.postMessage(workerStates.READY.f()));

  worker.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if ('action' in msg) {
      handleAction(msg);
    }
  };
})();

/**
 * @param msg
 */
function handleAction(msg: MapStringTo<any>) {
  if ('action' in msg) {
    switch (msg.action) {
      case clientActions.MODIFY.k: {
        const { data: noteData } = msg;
        ModifyNote(noteData);
        break;
      }
      case clientActions.GET_BY_UUID.k: {
        const { data: reqUuid } = msg;
        GetNoteByUuid(reqUuid);
        break;
      }
      case clientActions.DEL_BY_UUID.k: {
        const { data: delUuid } = msg;
        DeleteNoteByUuid(delUuid);
        break;
      }
      case clientActions.GET_LIST.k:
        GetNoteList();
        break;
      case clientActions.EXPORT_NOTES.k:
        ExportNotes();
        break;
      default:
    }
  }
}

/**
 *
 */
function getList(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get('/🔌/v1/note/list')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 *
 */
function exportNotes(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get('/🔌/v1/note/export')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * @param note
 */
function sendUpsert(note: NotePackage): Promise<any> {
  return new Promise((resolve, reject) => {
    const {
      uuid,
      title,
      content,
      tags,
      inTrashcan,
      isDeleted,
    } = note.toObj();
    console.debug(uuid);

    axios.put('/🔌/v1/note/upsert', {
      uuid,
      title,
      content,
      tags,
      inTrashcan,
      isDeleted,
    })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * @param uuid
 */
function getFromApiByUuid(uuid: string): Promise<Note> {
  return new Promise((resolve, reject) => {
    axios.get(`/🔌/v1/note/uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * @param uuid
 */
function delFromApiByUuid(uuid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(`/🔌/v1/note/uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * @param note
 */
function ModifyNote(note: Note) {
  noteDb
    .modifyRecord(new NotePackage(note))
    .then((uuid) => noteDb.getRecordByUuid(uuid))
    .then((records) => records.toArray())
    .then((arr) => sendUpsert(new NotePackage(arr[0])).then((r) => r).catch((e) => console.warn(e)))
    .then((response) => worker.postMessage(workerStates.UPD8_COMP.f(response)))
    .catch((error) => console.warn(`Inbound request to modify record failed.\n${error}`));
}

/**
 * @param uuid
 */
function GetNoteByUuid(uuid: string) {
  noteDb
    .getRecordByUuid(uuid ?? '')
    .then((records) => records.toArray())
    .then((recordsArray) => {
      if (recordsArray.length === 0) {
        getFromApiByUuid(uuid)
          .then((note) => noteDb.modifyRecord(new NotePackage(note)))
          .then(() => noteDb.getRecordByUuid(uuid))
          .then((records) => records.toArray())
          .then((arr) => worker.postMessage(workerStates.NOTE_DATA.f(new NotePackage(arr[0]))))
          .catch((error) => console.warn(error));
      } else {
        worker.postMessage(workerStates.NOTE_DATA.f(new NotePackage(recordsArray[0])));
      }
    })
    .catch((error) => console.warn(error));
}

/**
 * @param uuid
 */
function DeleteNoteByUuid(uuid: string) {
  noteDb.delRecordByUuid(uuid)
    .catch((reason) => console.warn(reason))
    .then(() => delFromApiByUuid(uuid))
    .then(() => worker.postMessage(workerStates.DEL_COMP.f(uuid)))
    .catch((reason) => console.warn(reason));
}

/**
 *
 */
function GetNoteList() {
  getList()
    .then((response) => {
      noteDb.syncRecords(response.map((note) => new NotePackage(note)));
      worker.postMessage(workerStates.NOTE_LIST.f(response));
    })
    .catch((error) => console.warn(`Inbound request to fetch a record failed.\n${error}`));
}

/**
 *
 */
function ExportNotes() {
  exportNotes().then((response) => worker.postMessage(workerStates.EXPORT_DATA.f(response)));
}
