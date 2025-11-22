import * as NoteRepository from '../repositories/NoteRepository';
import { createNoteSchema, updateNoteSchema } from '../utils/noteValidationSchemas';
import { z } from 'zod';
import { NotFoundError } from '../utils/AppError';
import { Note } from '@prisma/client';

type CreateNoteInput = z.infer<typeof createNoteSchema>['body'];
type UpdateNoteInput = z.infer<typeof updateNoteSchema>['body'];

/**
 * Get all notes for a user with optional search/filter
 * @param userId - The user's ID
 * @returns Array of user's notes
 */
export const getAllNotes = async (userId: string): Promise<Note[]> => {
    const notes = await NoteRepository.findByUserId(userId);
    return notes;
};

/**
 * Get a specific note by ID
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The requested note
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
export const getNoteById = async (id: string, userId: string): Promise<Note> => {
    const note = await NoteRepository.findById(id, userId);

    if (!note) {
        throw new NotFoundError(`Note with ID ${id} not found`);
    }

    return note;
};

/**
 * Create a new note
 * @param userId - The user's ID
 * @param input - Note creation data
 * @returns The created note
 */
export const createNote = async (userId: string, input: CreateNoteInput): Promise<Note> => {
    const note = await NoteRepository.create({
        userId,
        title: input.title,
        content: input.content,
        tags: input.tags,
    });

    return note;
};

/**
 * Update an existing note
 * @param id - The note ID
 * @param userId - The user's ID
 * @param input - Update data
 * @returns The updated note
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
export const updateNote = async (
    id: string,
    userId: string,
    input: UpdateNoteInput
): Promise<Note> => {
    // Verify note exists and user owns it
    const existingNote = await NoteRepository.findById(id, userId);

    if (!existingNote) {
        throw new NotFoundError(`Note with ID ${id} not found`);
    }

    const updatedNote = await NoteRepository.update(id, userId, input);
    return updatedNote;
};

/**
 * Delete a note
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns Success message
 * @throws NotFoundError if note doesn't exist or user doesn't own it
 */
export const deleteNote = async (
    id: string,
    userId: string
): Promise<{ message: string }> => {
    // Verify note exists and user owns it
    const existingNote = await NoteRepository.findById(id, userId);

    if (!existingNote) {
        throw new NotFoundError(`Note with ID ${id} not found`);
    }

    await NoteRepository.remove(id, userId);
    return { message: 'Note deleted successfully' };
};

/**
 * Search notes by query and/or tag
 * @param userId - The user's ID
 * @param query - Optional search query
 * @param tag - Optional tag filter
 * @returns Array of matching notes
 */
export const searchNotes = async (
    userId: string,
    query?: string,
    tag?: string
): Promise<Note[]> => {
    const notes = await NoteRepository.searchNotes(userId, query || '', tag);
    return notes;
};
