import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import AuthRoutes from './routes/AuthRoutes';
import NoteRoutes from './routes/NoteRoutes';
import AttachmentRoutes from './routes/attachments';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use('/auth', AuthRoutes);
app.use('/notes', NoteRoutes);
app.use('/api/attachments', AttachmentRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
