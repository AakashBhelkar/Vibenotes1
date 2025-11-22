import { Response, NextFunction } from 'express';
import * as NoteService from '../services/NoteService';
import { AuthRequest } from '../middleware/auth';
import { UnauthorizedError } from '../utils/AppError';

/**
 * Get all notes for the authenticated user
 * Supports optional search query and tag filtering
 */
export const getAllNotes = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { q, tag } = req.query;

        const notes = await NoteService.searchNotes(
            userId,
            q as string | undefined,
            tag as string | undefined
        );

        res.json(notes);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a specific note by ID
 */
export const getNoteById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const note = await NoteService.getNoteById(id, userId);
        res.json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new note
 */
export const createNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const note = await NoteService.createNote(userId, req.body);
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing note
 */
export const updateNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const note = await NoteService.updateNote(id, userId, req.body);
        res.json(note);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a note
 */
export const deleteNote = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        if (!req.user?.id) {
            throw new UnauthorizedError('User not authenticated');
        }
        const userId = req.user.id;
        const { id } = req.params;

        const result = await NoteService.deleteNote(id, userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
