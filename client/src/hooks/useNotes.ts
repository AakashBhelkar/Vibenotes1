import { useState, useEffect } from 'react';
import { noteStorage } from '@/services/noteStorage';
import { authService } from '@/services/authService';
import { Note } from '@/lib/db';

/**
 * Hook to manage notes with offline storage
 * Provides CRUD operations and search functionality
 * @returns Note management functions and state
 */
export function useNotes() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNotes = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const allNotes = await noteStorage.getAll();
            setNotes(allNotes);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load notes';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotes();
    }, []);

    const createNote = async (
        title: string,
        content: string,
        tags: string[] = []
    ): Promise<Note> => {
        try {
            const user = authService.getUser();
            if (!user?.id) {
                throw new Error('User not authenticated');
            }

            const newNote = await noteStorage.create({
                userId: user.id,
                title,
                content,
                tags,
                isPinned: false,
                isArchived: false,
            });
            setNotes(prev => [newNote, ...prev]);
            setError(null);
            return newNote;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const updateNote = async (
        id: string,
        updates: Partial<Note>
    ): Promise<Note | undefined> => {
        try {
            const updated = await noteStorage.update(id, updates);
            if (updated) {
                setNotes(prev => prev.map(n => n.id === id ? updated : n));
                setError(null);
            }
            return updated;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const deleteNote = async (id: string): Promise<void> => {
        try {
            await noteStorage.delete(id);
            setNotes(prev => prev.filter(n => n.id !== id));
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete note';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const searchNotes = async (query: string): Promise<void> => {
        try {
            const results = await noteStorage.search(query);
            setNotes(results);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search notes';
            setError(errorMessage);
        }
    };

    const filterByTag = async (tag: string): Promise<void> => {
        try {
            const results = await noteStorage.filterByTag(tag);
            setNotes(results);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to filter notes';
            setError(errorMessage);
        }
    };

    return {
        notes,
        isLoading,
        error,
        createNote,
        updateNote,
        deleteNote,
        searchNotes,
        filterByTag,
        refresh: loadNotes,
    };
}
