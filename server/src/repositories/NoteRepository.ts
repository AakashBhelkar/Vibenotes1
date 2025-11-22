import prisma from '../config/db';
import { Note, Prisma } from '@prisma/client';

/**
 * Find all notes for a specific user
 * @param userId - The user's ID
 * @returns Array of notes sorted by pinned status and update time
 */
export const findByUserId = async (userId: string): Promise<Note[]> => {
    return prisma.note.findMany({
        where: { userId },
        orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' },
        ],
    });
};

/**
 * Find a specific note by ID and verify user ownership
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The note if found and owned by user, null otherwise
 */
export const findById = async (id: string, userId: string): Promise<Note | null> => {
    return prisma.note.findFirst({
        where: { id, userId },
    });
};

/**
 * Create a new note for a user
 * @param data - Note creation data
 * @returns The created note
 */
export const create = async (data: {
    userId: string;
    title: string;
    content: string;
    tags?: string[];
}): Promise<Note> => {
    return prisma.note.create({
        data: {
            userId: data.userId,
            title: data.title,
            content: data.content,
            tags: data.tags || [],
        },
    });
};

/**
 * Update a note with user ownership verification
 * @param id - The note ID
 * @param userId - The user's ID
 * @param data - Update data
 * @returns The updated note
 * @throws Error if note doesn't exist or user doesn't own it
 */
export const update = async (
    id: string,
    userId: string,
    data: {
        title?: string;
        content?: string;
        tags?: string[];
        isPinned?: boolean;
        isArchived?: boolean;
    }
): Promise<Note> => {
    // Verify ownership before updating
    return prisma.note.update({
        where: {
            id,
            userId, // Ensures user owns the note
        },
        data: {
            ...data,
            version: { increment: 1 },
        },
    });
};

/**
 * Delete a note with user ownership verification
 * @param id - The note ID
 * @param userId - The user's ID
 * @returns The deleted note
 * @throws Error if note doesn't exist or user doesn't own it
 */
export const remove = async (id: string, userId: string): Promise<Note> => {
    // Verify ownership before deleting
    return prisma.note.delete({
        where: {
            id,
            userId, // Ensures user owns the note
        },
    });
};

/**
 * Search notes by query and/or tag
 * @param userId - The user's ID
 * @param query - Search query for title/content
 * @param tag - Optional tag filter
 * @returns Array of matching notes
 */
export const searchNotes = async (
    userId: string,
    query: string,
    tag?: string
): Promise<Note[]> => {
    const where: Prisma.NoteWhereInput = { userId };

    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
        ];
    }

    if (tag) {
        where.tags = { has: tag };
    }

    return prisma.note.findMany({
        where,
        orderBy: [
            { isPinned: 'desc' },
            { updatedAt: 'desc' },
        ],
    });
};
