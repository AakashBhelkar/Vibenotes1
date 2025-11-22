import { z } from 'zod';

export const signupSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string(),
    }),
});
