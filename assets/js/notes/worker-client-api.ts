export interface Note extends MapStringTo<any> {
    clientUuid?: string|null;
    title: string;
    content: string;
    tags: string[];
    inTrashcan?: boolean;
    isDeleted?: boolean;
    createdDate?: Date|null;
    lastModified?: Date|null;
}

export const clientActions = Object.freeze({
    GET_LIST: {
        k: 'getNoteList',
        f: (): string => packAction(clientActions.GET_LIST.k),
    },
    MODIFY: {
        k: 'modify',
        f: (note: NotePackage): string => packAction(clientActions.MODIFY.k, note),
    },
    RECYCLE: {
        k: 'recycle',
        f: (uuid: string): string => packAction(clientActions.RECYCLE.k, uuid),
    },
    GET_BY_CLIENTUUID: {
        k: 'retrieveByUuid',
        f: (uuid: string):string => packAction(clientActions.GET_BY_CLIENTUUID.k, uuid),
    },
    DEL_BY_CLIENTUUID: {
        k: 'deleteByUuid',
        f: (uuid: string): string => packAction(clientActions.DEL_BY_CLIENTUUID.k, uuid),
    },
    EXPORT_NOTES: {
        k: 'exportNotes',
        f: (): string => packAction(clientActions.EXPORT_NOTES.k),
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
});

function packAction(action: string, data?: any): string {
    return stringIt({ action, data });
}

function packState(state: string, data?: any): string {
    return stringIt({ state, data });
}

function stringIt(obj: Object): string {
    return JSON.stringify(obj);
}

export interface NotePackageExport extends MapStringTo<any> {
    id?: number;
    clientUuid?: string;
    title?: string;
    content?: string;
    tags?: string[];
    inTrashcan?: boolean;
    isDeleted?: boolean;
    createdDate?: Date;
    lastModified?: Date;
}

export class NotePackage {
    id: number|null;
    clientUuid: string|null;
    title: string;
    content: string;
    tags: string[];
    inTrashcan: boolean;
    isDeleted: boolean;
    createdDate: Date|null;
    lastModified: Date|null;

    constructor(optionalProperties: Note) {
        this.id = optionalProperties.id ?? null;
        this.clientUuid = optionalProperties.clientUuid?.trim() || null;
        this.title = optionalProperties.title.trim();
        this.content = optionalProperties.content;
        this.tags = optionalProperties.tags.filter((value, index, self) => self.indexOf(value) === index);
        this.inTrashcan = optionalProperties.inTrashcan ?? false;
        this.isDeleted = optionalProperties.isDeleted ?? false;
        this.createdDate = optionalProperties.createdDate ?? null;
        this.lastModified = optionalProperties.lastModified ?? null;
    }

    public toObj(): NotePackageExport {
        const noteObj: NotePackageExport = {};

        [
            'clientUuid',
            'title',
            'content',
            'tags',
            'inTrashcan',
            'isDeleted',
            'createdDate',
            'lastModified',
        ].forEach((prop: string) => {
            const value = this.getProperty(this, prop as keyof this);
            if (value ?? false) noteObj[prop] = value;
        });

        return noteObj;
    }

    private getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
        // o[propertyName] is of type T[K]
        return o[propertyName];
    }
}
