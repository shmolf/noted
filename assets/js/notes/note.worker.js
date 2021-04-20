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
    const data = JSON.parse(e.data);
    console.log(data);

    worker.postMessage(JSON.stringify(data));
  };
})();
