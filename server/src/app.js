import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import applicationRoutes, { appRouter as applicationActionsRouter } from './routes/application.routes.js';

const app = express();

// middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/shifts', applicationRoutes);
app.use('/api/applications', applicationActionsRouter);

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
