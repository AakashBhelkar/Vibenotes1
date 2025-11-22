import apiClient from '@/lib/apiClient';
import { noteStorage } from './noteStorage';
import { Note } from '@/lib/db';

/**
 * Sync service for syncing local changes with server
 * Implements offline-first sync logic from architecture.md
 */
export const syncService = {
    /**
     * Check if online
     */
    isOnline(): boolean {
        return navigator.onLine;
    },

    /**
     * Sync all pending changes to server
     */
    async syncToServer(): Promise<{ success: boolean; errors: string[] }> {
        if (!this.isOnline()) {
            return { success: false, errors: ['Device is offline'] };
        }

        const queue = await noteStorage.getSyncQueue();
        const errors: string[] = [];

        for (const item of queue) {
            try {
                switch (item.action) {
                    case 'CREATE':
                        await apiClient.post('/notes', item.data);
                        break;
                    case 'UPDATE':
                        await apiClient.put(`/notes/${item.noteId}`, item.data);
                        break;
                    case 'DELETE':
                        await apiClient.delete(`/notes/${item.noteId}`);
                        break;
                }

                // Remove from queue on success
                if (item.id) {
                    await noteStorage.removeSyncQueueItem(item.id);
                }
            } catch (error: any) {
                const status = error.response?.status;

                // If note not found (404), it was likely deleted on server
                // We should remove this action from queue to stop retrying
                if (status === 404) {
                    if (item.id) {
                        await noteStorage.removeSyncQueueItem(item.id);
                    }
                    continue;
                }

                errors.push(`Failed to sync ${item.action} for note ${item.noteId}: ${error.message}`);

                // Increment retry count
                if (item.id && item.retryCount < 3) {
                    // Could implement retry logic here
                }
            }
        }

        return { success: errors.length === 0, errors };
    },

    /**
     * Sync notes from server to local storage
     */
    async syncFromServer(): Promise<{ success: boolean; error?: string }> {
        if (!this.isOnline()) {
            return { success: false, error: 'Device is offline' };
        }

        try {
            const response = await apiClient.get<Note[]>('/notes');
            await noteStorage.syncFromServer(response.data);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error?.message || 'Failed to sync from server'
            };
        }
    },

    /**
     * Full bidirectional sync
     */
    async fullSync(): Promise<{ success: boolean; errors: string[] }> {
        // First sync local changes to server
        const uploadResult = await this.syncToServer();

        // Then sync server changes to local
        const downloadResult = await this.syncFromServer();

        const errors = [...uploadResult.errors];
        if (downloadResult.error) {
            errors.push(downloadResult.error);
        }

        return { success: errors.length === 0, errors };
    },

    /**
     * Setup auto-sync on network status change
     */
    setupAutoSync(callback?: (result: { success: boolean; errors: string[] }) => void): () => void {
        const handleOnline = async () => {
            const result = await this.fullSync();
            callback?.(result);
        };

        window.addEventListener('online', handleOnline);

        // Return cleanup function
        return () => {
            window.removeEventListener('online', handleOnline);
        };
    },
};
