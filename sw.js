/* eslint-env serviceworker */
/// <reference lib="webworker" />

import db from 'JS/notes/db';

(() => {
  const { self } = window;
  const sw = /** @type {ServiceWorkerGlobalScope} */(/** @type {any} */(self));

  sw.addEventListener('install', (event) => {
    event.waitUntil(sw.skipWaiting());
  });

  // The activate handler takes care of cleaning up old caches.
  sw.addEventListener('activate', (event) => {
  });
})();
