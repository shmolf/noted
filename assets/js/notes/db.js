import Dexie from 'node_modules/dexie/dist/dexie.mjs';

const db = new Dexie('noted');
db.version(1).stores({
  friends: `name, age`
});

export default db;
