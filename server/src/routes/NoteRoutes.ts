import { Router } from 'express';
import * as NoteController from '../controllers/NoteController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNoteSchema, updateNoteSchema } from '../utils/noteValidationSchemas';

const router = Router();

// All note routes require authentication
router.use(authenticate);

router.get('/', NoteController.getAllNotes);
router.post('/', validate(createNoteSchema), NoteController.createNote);
router.get('/:id', NoteController.getNoteById);
router.put('/:id', validate(updateNoteSchema), NoteController.updateNote);
router.delete('/:id', NoteController.deleteNote);

export default router;
