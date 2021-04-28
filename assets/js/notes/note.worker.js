/* eslint-disable no-restricted-globals */
/* eslint-env self */
/// <reference lib="webworker" />\

import noteDb from 'JS/notes/noteDb';
import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import axios from 'axios';

if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
  console.log('badges are enabled');
  navigator.setAppBadge(1).catch((error) => {
    console.log(error);
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
        noteDb
          .modifyRecord(new NotePackage(msg.data))
          .then((recordId) => noteDb.getRecordById(recordId))
          .then((note) => sendUpsert(note).then((r) => r).catch((e) => console.warn(e)))
          .then((r) => noteDb.updateNoteUuid(r.clientUuid, r.noteUuid).then(() => r).catch((e) => console.warn(e)))
          .then((response) => worker.postMessage(workerStates.UPD8_COMP.f(response)))
          .catch((error) => console.warn(`Inbound request to modify record failed.\n${error}`));
        break;
      case clientActions.GET_BY_CLIENTUUID.k:
        noteDb
          .getRecordByClientUuid(msg.data)
          .then((records) => {
            if (records === null) {
              getByClientUuid(msg.data)
                .then((note) => noteDb.modifyRecord(new NotePackage(note)))
                .then((recordId) => noteDb.getRecordById(recordId))
                .then((response) => worker.postMessage(workerStates.UPD8_COMP.f(response)))
                .catch((error) => console.warn(error));
            } else {
              records.first()
                .then((/** @type {NotePackageOptions} */record) => new NotePackage(record))
                .then((notePkg) => worker.postMessage(workerStates.NOTE_DATA.f(notePkg)));
            }
          })
          .catch((error) => console.warn(error));
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
    axios.put('/🔌/v1/note/upsert', {
      noteUuid: note.noteUuid || null,
      clientUuid: note.clientUuid,
      title: note.title,
      content: note.content,
      tags: note.tags,
      inTrashcan: note.inTrashcan,
    })
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(['data', error.response.data]);
          console.log(['status', error.response.status]);
          console.log(['headers', error.response.headers]);
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
    axios.get(`/🔌/v1/note/clientUuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(['data', error.response.data]);
          console.log(['status', error.response.status]);
          console.log(['headers', error.response.headers]);
        }

        reject(error);
      });
  });
}
