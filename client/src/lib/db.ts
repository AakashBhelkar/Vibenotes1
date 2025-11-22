import Dexie, { Table } from 'dexie';

/**
 * Note interface matching backend schema
 */
export interface Note {
    id: string;
    userId: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    isArchived: boolean;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    syncedAt?: Date;
}

/**
 * Sync queue item for offline changes
 */
export interface SyncQueueItem {
    id?: number;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    noteId: string;
    data?: Partial<Note>;
    timestamp: Date;
    retryCount: number;
}

/**
 * Dexie database for offline storage
 * Follows architecture.md specifications
 */
export class VibeNotesDB extends Dexie {
    notes!: Table<Note, string>;
    syncQueue!: Table<SyncQueueItem, number>;

    constructor() {
        super('VibeNotesDB');

        this.version(1).stores({
            notes: 'id, userId, isPinned, isArchived, updatedAt, *tags',
            syncQueue: '++id, noteId, timestamp',
        });
    }
}

export const db = new VibeNotesDB();
