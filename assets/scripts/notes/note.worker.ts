/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  workerStates, clientActions, NotePackage, Note, WorkspacePackage,
} from 'SCRIPTS/notes/worker-client-api';
import axios from 'axios';
import { MapStringTo } from 'SCRIPTS/types/Generic';
import { TokenSourcePayload } from 'SCRIPTS/types/Api';

// eslint-disable-next-line no-restricted-globals
const worker:Worker = self as any;
let activeWorkspace: WorkspacePackage|null = null;
let accessToken: TokenSourcePayload|null = null;

(() => {
  worker.onmessage = (e) => {
    const msg = JSON.parse(e.data);

    if ('action' in msg) handleAction(msg);
  };

  worker.postMessage(workerStates.READY.f());
})();

function handleAction(msg: MapStringTo<any>) {
  if ('action' in msg) {
    switch (msg.action) {
      case clientActions.NEW_NOTE.k: {
        NewNote();
        break;
      }
      case clientActions.MODIFY.k: {
        const { data: noteData } = msg;
        ModifyNote(noteData);
        break;
      }
      case clientActions.GET_BY_UUID.k: {
        const { data: uuid } = msg;
        GetNoteByUuid(uuid);
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
      case clientActions.GET_WKSP_BYUUID.k: {
        const { data: uuid } = msg;
        GetWorkspace(uuid);
        break;
      }
      default:
    }
  }
}

function getList(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get(
      `${getWorkspaceOrigin()}/🔌/v1/note/list`,
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function exportNotes(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    axios.get(
      `${getWorkspaceOrigin()}/🔌/v1/note/export`,
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function sendNewNoteRequest(): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.post(
      `${getWorkspaceOrigin()}/🔌/v1/note/new`,
      {},
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

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

    axios.put(
      `${getWorkspaceOrigin()}/🔌/v1/note/uuid/${uuid}`,
      {
        title,
        content,
        tags,
        inTrashcan,
        isDeleted,
      },
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function getFromApiByUuid(uuid: string): Promise<Note> {
  return new Promise((resolve, reject) => {
    axios.get(
      `${getWorkspaceOrigin()}/🔌/v1/note/uuid/${uuid}`,
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function delFromApiByUuid(uuid: string): Promise<any> {
  return new Promise((resolve, reject) => {
    axios.delete(
      `${getWorkspaceOrigin()}/🔌/v1/note/uuid/${uuid}`,
      {
        headers: {
          'X-TOKEN-ACCESS': accessToken?.token,
        },
      },
    )
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

/**
 * This'll request the Workspace meta data associated with the currently selected workspace, sourced from Note-d.app
 */
function getWorkspaceByUuid(uuid: string): Promise<WorkspacePackage> {
  return new Promise((resolve, reject) => {
    axios.get(`/🔌/v1/workspace/uuid/${uuid}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

function getAccessToken(): Promise<TokenSourcePayload> {
  if (activeWorkspace === null) throw Error('Workspace is not yet loaded');

  return new Promise((resolve, reject) => {
    axios.get(
      `${activeWorkspace!.tokenUri}?grant_type=accessToken`,
      {
        headers: {
          'X-TOKEN-REFRESH': activeWorkspace?.token,
        },
      },
    ).then((response) => {
      const tokenPayload: TokenSourcePayload = response.data;
      resolve(tokenPayload);
    }).catch((error) => reject(error));
  });
}

function getWorkspaceOrigin(): string {
  if (activeWorkspace === null) throw Error('Workspace is not yet loaded. Cannot get origin.');
  return activeWorkspace.origin;
}

/// Wrapper Functions

function NewNote() {
  sendNewNoteRequest()
    .then((r) => r).catch((e) => console.warn(e))
    .then((response) => worker.postMessage(workerStates.NEW_NOTE_READY.f(response)))
    .catch((error) => console.warn(`Request to create a new note failed.\n${error}`));
}

function ModifyNote(note: Note) {
  sendUpsert(new NotePackage(note))
    .then((r) => r).catch((e) => console.warn(e))
    .then((response) => worker.postMessage(workerStates.UPD8_COMP.f(response)))
    .catch((error) => console.warn(`Inbound request to modify record failed.\n${error}`));
}

function GetNoteByUuid(uuid: string) {
  getFromApiByUuid(uuid)
    .then((note) => worker.postMessage(workerStates.NOTE_DATA.f(new NotePackage(note))))
    .catch((error) => console.warn(error));
}

function DeleteNoteByUuid(uuid: string) {
  delFromApiByUuid(uuid)
    .then(() => worker.postMessage(workerStates.DEL_COMP.f(uuid)))
    .catch((reason) => console.warn(reason));
}

function GetNoteList() {
  getList()
    .then((response) => worker.postMessage(workerStates.NOTE_LIST.f(response)))
    .catch((error) => console.warn(`Inbound request to fetch a record failed.\n${error}`));
}

function ExportNotes() {
  exportNotes().then((response) => worker.postMessage(workerStates.EXPORT_DATA.f(response)));
}

function GetWorkspace(uuid: string) {
  activeWorkspace = null;
  accessToken = null;

  getWorkspaceByUuid(uuid)
    .then((workspace) => {
      activeWorkspace = workspace;
      getAccessToken().then((tokenPayload) => {
        accessToken = tokenPayload;
        worker.postMessage(workerStates.WORKSPACE_DATA.f(workspace));
      }).catch((error) => {
        console.warn(error);
        worker.postMessage(workerStates.WORKSPACE_INVALID.f(uuid));
      });
    });
}
