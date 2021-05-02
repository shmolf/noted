/* eslint-disable no-case-declarations */
/* eslint-disable no-restricted-globals */
/* eslint-env self */
/// <reference lib="webworker" />\

import noteDb from 'JS/notes/noteDb';
import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import axios from 'axios';

if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
  // @ts-ignore
  navigator.setAppBadge(1).catch((error) => {
    console.error(error);
  });
}

/** @typedef {import('JS/notes/worker-client-api').NotePackageOptions} NotePackageOptions */

/** @type {Worker} */
const worker = (/** @type {any} */(self));

(() => {
  noteDb.buildDb().then(() => {
    worker.postMessage(workerStates.READY.f());
  });

  worker.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if ('action' in msg) {
      handleAction(msg);
    }
  };
})();

/**
 * @param {Object.<string, any>} msg
 */
function handleAction(msg) {
  if ('action' in msg) {
    switch (msg.action) {
      case clientActions.MODIFY.k:
        const { data: noteData } = msg;
        noteDb
          .modifyRecord(new NotePackage(noteData))
          .then((uuid) => noteDb.getRecordByClientUuid(uuid))
          .then((records) => records.toArray())
          .then((arr) => sendUpsert(new NotePackage(arr[0])).then((r) => r).catch((e) => console.warn(e)))
          .then((response) => worker.postMessage(workerStates.UPD8_COMP.f(response)))
          .catch((error) => console.warn(`Inbound request to modify record failed.\n${error}`));
        break;
      case clientActions.GET_BY_CLIENTUUID.k:
        const { data: uuid } = msg;
        noteDb
          .getRecordByClientUuid(uuid)
          .then((records) => records.toArray())
          .then((recordsArray) => {
            if (recordsArray === null || recordsArray === undefined || recordsArray.length === 0) {
              getByClientUuid(uuid)
                .then((note) => noteDb.modifyRecord(new NotePackage(note)))
                .then((clientUuid) => noteDb.getRecordByClientUuid(clientUuid))
                .then((records) => records.toArray())
                .then((arr) => worker.postMessage(workerStates.NOTE_DATA.f(arr[0])))
                .catch((error) => console.warn(error));
            } else {
              worker.postMessage(workerStates.NOTE_DATA.f(/** @type {NotePackageOptions} */recordsArray[0]));
            }
          })
          .catch((error) => console.warn(error));
        break;
      case clientActions.DEL_BY_CLIENTUUID.k:
        Promise.all([
          delByClientUuid(msg.data),
          noteDb.delRecordByClientUuid(msg.data),
        ])
          .then(() => worker.postMessage(workerStates.DEL_COMP.f()))
          .catch((reason) => console.warn(reason));
        break;
      case clientActions.GET_LIST.k:
        getList()
          .then((response) => {
            noteDb.syncRecords(response.map((note) => new NotePackage(note)));
            worker.postMessage(workerStates.NOTE_LIST.f(response));
          })
          .catch((error) => console.warn(`Inbound request to fetch a record failed.\n${error}`));
        break;
      default:
    }
  }
}

/**
 * @returns {Promise<Array>}
 */
function getList() {
  return new Promise((resolve, reject) => {
    axios.get('/🔌/v1/note/list')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * @param {NotePackage} note
 * @returns {Promise}
 */
function sendUpsert(note) {
  return new Promise((resolve, reject) => {
    const {
      clientUuid,
      title,
      content,
      tags,
      inTrashcan,
      isDeleted,
    } = note.toObj();

    axios.put('/🔌/v1/note/upsert', {
      clientUuid,
      title,
      content,
      tags,
      inTrashcan,
      isDeleted,
    })
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
        }

        reject(error);
      });
  });
}

/**
 * @param {string} uuid
 * @returns {Promise}
 */
function getByClientUuid(uuid) {
  return new Promise((resolve, reject) => {
    axios.get(`/🔌/v1/note/client-uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
        }

        reject(error);
      });
  });
}

/**
 * @param {string} uuid
 * @returns {Promise}
 */
function delByClientUuid(uuid) {
  return new Promise((resolve, reject) => {
    axios.delete(`/🔌/v1/note/client-uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error(error.response.data);
        }

        reject(error);
      });
  });
}
