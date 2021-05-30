import noteDb from 'JS/notes/noteDb';
import { workerStates, clientActions, NotePackage } from 'JS/notes/worker-client-api';
import axios from 'axios';

// if ('setAppBadge' in window.navigator && 'clearAppBadge' in window.navigator) {
//     // @ts-ignore
//     window.navigator.setAppBadge(1).catch((error: any) => {
//         console.error(error);
//     });
// }

const worker:Worker = self as any;

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

function handleAction(msg: MapStringTo<any>) {
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
                const { data: reqUuid } = msg;
                noteDb
                    .getRecordByClientUuid(reqUuid ?? '')
                    .then((records) => records.toArray())
                    .then((recordsArray) => {
                        if (recordsArray.length === 0) {
                            getFromApiByClientUuid(reqUuid)
                                .then((note) => noteDb.modifyRecord(new NotePackage(note)))
                                .then((uuid) => noteDb.getRecordByClientUuid(uuid))
                                .then((records) => records.toArray())
                                .then((arr) => worker.postMessage(workerStates.NOTE_DATA.f(new NotePackage(arr[0]))))
                                .catch((error) => console.warn(error));
                        } else {
                            worker.postMessage(workerStates.NOTE_DATA.f(new NotePackage(recordsArray[0])));
                        }
                    })
                .catch((error) => console.warn(error));
                break;
            case clientActions.DEL_BY_CLIENTUUID.k:
                const { data: delUuid } = msg;
                noteDb.delRecordByClientUuid(delUuid)
                .catch((reason) => console.warn(reason))
                .then(() => delFromApiByClientUuid(delUuid))
                .then(() => worker.postMessage(workerStates.DEL_COMP.f(delUuid)))
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
            case clientActions.EXPORT_NOTES.k:
                exportNotes().then((response) => worker.postMessage(workerStates.EXPORT_DATA.f(response)));
                break;
            default:
        }
    }
}

function getList(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get('/🔌/v1/note/list')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function exportNotes(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get('/🔌/v1/note/export')
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function sendUpsert(note: NotePackage): Promise<any> {
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
                if (error.response) console.error(error.response.data);

                reject(error);
            });
    });
}

function getFromApiByClientUuid(uuid: string): Promise<any> {
    return new Promise((resolve, reject) => {
        axios.get(`/🔌/v1/note/client-uuid/${uuid}`)
            .then((response) => resolve(response.data))
            .catch((error) => {
                if (error.response) console.error(error.response.data);

                reject(error);
            });
    });
}

function delFromApiByClientUuid(uuid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(`/🔌/v1/note/client-uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => {
        if (error.response) console.error(error.response.data);

        reject(error);
      });
  });
}
