/* eslint-disable no-restricted-globals */
/* eslint-env self */
/// <reference lib="webworker" />
import noteDb from 'JS/notes/noteDb';
import { workerStates, clientActions } from 'JS/notes/worker-client-api';

if ('setAppBadge' in navigator && 'clearAppBadge' in navigator) {
  console.log('badges are enabled');
  navigator.setAppBadge(1).catch((error) => {
    console.log(error);
  });
}

/** @type {ServiceWorkerGlobalScope} */
const worker = (/** @type {any} */(self));

(() => {
  noteDb.buildDb().then(() => {
    worker.postMessage(JSON.stringify({ state: workerStates.TEST }));
  });

  worker.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if ('action' in msg) {
      handleAction(msg);
    }
  };
})();

function handleAction(msg) {
  if ('action' in msg) {
    switch (msg.action) {
      case clientActions.MODIFY.k:
        noteDb
          .modifyRecord(msg.data)
          .then(() => worker.postMessage(JSON.stringify({ state: workerStates.TEST_READY })))
          .catch((error) => console.warn(`Inbound request to modify record failed.\n${error}`));
        break;
      case clientActions.GET_BY_UUID.k:
        console.log(msg.data);
        noteDb
          .getRecordByUuid(msg.data)
          .then((note) => {
            note.toArray((records) => {
              worker.postMessage(JSON.stringify({ state: workerStates.NOTE_DATA, note: records?.[0] }));
            });
          })
          .catch((error) => console.warn(`Inbound request to fetch a record failed.\n${error}`));
        break;
      default:
    }
  }
}
