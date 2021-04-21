export const clientActions = Object.freeze({
  MODIFY: {
    k: 'modify',
    f: (data) => packIt(clientActions.MODIFY.k, data),
  },
  GET_BY_UUID: {
    k: 'retrieveByUuid',
    f: (data) => packIt(clientActions.GET_BY_UUID.k, data),
  },
});

export const workerStates = Object.freeze({
  TEST: 'test',
  TEST_READY: 'test-ready',
  NOTE_DATA: 'note-data',
});

/**
 * Packages an action and data, into a transmittible object-string
 *
 * @param {string} action
 * @param {Object} data
 * @returns {string}
 */
function packIt(action, data) {
  return stringIt({ action, data });
}

/**
 * Json Stringifies an object
 *
 * @param {Object} obj
 * @returns {string}
 */
function stringIt(obj) {
  return JSON.stringify(obj);
}
