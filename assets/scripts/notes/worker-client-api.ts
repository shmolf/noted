import { DateTime } from 'SCRIPTS/types/Api';
import { MapStringTo } from 'SCRIPTS/types/Generic';

export interface Note extends MapStringTo<any> {
    uuid: string;
    title: string;
    content: string;
    tags: string[];
    inTrashcan?: boolean;
    isDeleted?: boolean;
    createdDate?: Date|null;
    lastModified?: Date|null;
}

/**
 * This interface is used to build up an initialized empty object literal.
 */
export interface NotePackageExport extends MapStringTo<any> {
    uuid?: string;
    title?: string;
    content?: string;
    tags?: string[];
    inTrashcan?: boolean;
    isDeleted?: boolean;
    createdDate?: Date;
    lastModified?: Date;
}

export interface WorkspacePackage {
  uuid: string,
  origin: string,
  name: string,
  token: string,
  tokenUri: string,
  tokenExpiration: DateTime,
  /* These properties are commented out, since they'll not really necessary, but are available
  createdDate: string,
  */
}

export const clientActions = Object.freeze({
  GET_LIST: {
    k: 'getNoteList',
    f: (): string => packAction(clientActions.GET_LIST.k),
  },
  NEW_NOTE: {
    k: 'newNote',
    f: (): string => packAction(clientActions.NEW_NOTE.k),
  },
  MODIFY: {
    k: 'modify',
    f: (note: NotePackage): string => packAction(clientActions.MODIFY.k, note),
  },
  RECYCLE: {
    k: 'recycle',
    f: (uuid: string): string => packAction(clientActions.RECYCLE.k, uuid),
  },
  GET_BY_UUID: {
    k: 'retrieveByUuid',
    f: (uuid: string):string => packAction(clientActions.GET_BY_UUID.k, uuid),
  },
  DEL_BY_UUID: {
    k: 'deleteByUuid',
    f: (uuid: string): string => packAction(clientActions.DEL_BY_UUID.k, uuid),
  },
  EXPORT_NOTES: {
    k: 'exportNotes',
    f: (): string => packAction(clientActions.EXPORT_NOTES.k),
  },
  GET_WKSP_BYUUID: {
    k: 'getWorkspaceByUuid',
    f: (uuid: string): string => packAction(clientActions.GET_WKSP_BYUUID.k, uuid),
  },
});

export const workerStates = Object.freeze({
  TEST: {
    k: 'test',
    f: (): string => packState(workerStates.TEST.k),
  },
  TEST_READY: {
    k: 'test-ready',
    f: (): string => packState(workerStates.TEST_READY.k),
  },
  READY: {
    k: 'ready',
    f: (): string => packState(workerStates.READY.k),
  },
  NOTE_LIST: {
    k: 'note-list',
    f: (list: any[]): string => packState(workerStates.NOTE_LIST.k, list),
  },
  NOTE_DATA: {
    k: 'note-data',
    f: (note: NotePackage): string => packState(workerStates.NOTE_DATA.k, note),
  },
  NEW_NOTE_READY: {
    k: 'new-note-ready',
    f: (response: any): string => packState(workerStates.NEW_NOTE_READY.k, response),
  },
  UPD8_COMP: {
    k: 'note-updated',
    f: (response: any): string => packState(workerStates.UPD8_COMP.k, response),
  },
  DEL_COMP: {
    k: 'note-deleted',
    f: (uuid: string): string => packState(workerStates.DEL_COMP.k, uuid),
  },
  EXPORT_DATA: {
    k: 'export-data',
    f: (notes: NotePackage[]): string => packState(workerStates.EXPORT_DATA.k, notes),
  },
  WORKSPACE_DATA: {
    k: 'worspace-data',
    f: (workspace: WorkspacePackage): string => packState(workerStates.WORKSPACE_DATA.k, workspace),
  },
  WORKSPACE_INVALID: {
    k: 'worspace-invalid',
    f: (uuid: string): string => packState(workerStates.WORKSPACE_INVALID.k, uuid),
  },
});

/**
 * @param action
 * @param data
 */
function packAction(action: string, data?: any): string {
  return stringIt({ action, data });
}

/**
 * @param state
 * @param data
 */
function packState(state: string, data?: any): string {
  return stringIt({ state, data });
}

/**
 * @param obj
 */
function stringIt(obj: MapStringTo<any>): string {
  return JSON.stringify(obj);
}

export class NotePackage {
  uuid: string;

  title: string;

  content: string;

  tags: string[];

  inTrashcan: boolean;

  isDeleted: boolean;

  createdDate: Date|null;

  lastModified: Date|null;

  constructor(optionalProperties: Note) {
    this.uuid = optionalProperties.uuid.trim();
    this.title = optionalProperties.title.trim() || '';
    this.content = optionalProperties.content || '';
    this.tags = optionalProperties.tags.filter((value, index, self) => self.indexOf(value) === index);
    this.inTrashcan = optionalProperties.inTrashcan ?? false;
    this.isDeleted = optionalProperties.isDeleted ?? false;
    this.createdDate = optionalProperties.createdDate ?? null;
    this.lastModified = optionalProperties.lastModified ?? null;
  }

  public toObj(): NotePackageExport {
    const noteObj: NotePackageExport = {};

    [
      'uuid',
      'title',
      'content',
      'tags',
      'inTrashcan',
      'isDeleted',
      'createdDate',
      'lastModified',
    ].forEach((prop: string) => {
      const value = this.getProperty(prop as keyof this);
      if (value !== undefined) noteObj[prop] = value;
    });

    return noteObj;
  }

  private getProperty<K extends keyof this>(propertyName: K): this[K]|undefined {
    return this[propertyName] ?? undefined;
  }
}
