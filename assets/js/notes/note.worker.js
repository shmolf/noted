/* eslint-disable no-restricted-globals */
/* eslint-env self */
/// <reference lib="webworker" />
import noteDb from 'JS/notes/noteDb';

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
    worker.postMessage(JSON.stringify({ state: 'ready' }));
  });

  worker.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if ('action' in msg) {
      switch (msg.action) {
        case 'modify':
          noteDb.modifyRecord(msg.data)
            .catch(() => console.warn('Inbound request to modify record failed.'));
          break;
        default:
      }
    }

    worker.postMessage(JSON.stringify(msg));
  };
})();
