// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';
import applicationRoutes from './routes/application.routes.js'; // NEW

const app = express();

// middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// mount routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/shifts', applicationRoutes); // application routes share the /api/shifts base

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// start
const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`API running on :${port}`));
});
