// // server/src/index.js
// import 'dotenv/config';
// import express from 'express';
// import cookieParser from 'cookie-parser';
// import cors from 'cors';
// import { connectDB } from './config/db.js';
// import authRoutes from './routes/auth.routes.js';
// import shiftRoutes from './routes/shift.routes.js';
// import applicationRoutes from './routes/application.routes.js'; // NEW

// const app = express();

// // middleware
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:5174'
//   ],
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());

// // mount routes
// app.use('/api/auth', authRoutes);
// app.use('/api/shifts', shiftRoutes);
// app.use('/api/shifts', applicationRoutes); // application routes share the /api/shifts base

// // health
// app.get('/api/health', (_req, res) => res.json({ ok: true }));

// import applicationRoutes from './routes/application.routes.js'; // if you used default export
// import { appRouter as applicationActionsRouter } from './routes/application.routes.js';

// // keep existing imports...
// app.use('/api/shifts', shiftRoutes); // existing
// app.use('/api/shifts', applicationRoutes); // GET /api/shifts/:shiftId/applications
// app.use('/api/applications', applicationActionsRouter); // POST /api/applications/:id/approve|reject


// // start
// const port = process.env.PORT || 5000;
// connectDB().then(() => {
//   app.listen(port, () => console.log(`API running on :${port}`));
// });

// server/src/index.js
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// NOTE: use the named export 'connectDB' (not default) if your ./config/db.js exports it that way
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import shiftRoutes from './routes/shift.routes.js';

// import the routers we created in application.routes.js
// application.routes.js exports:
//   - default export: router (shift-level routes like GET /:shiftId/applications)
//   - named export: appRouter as applicationActionsRouter (POST /applications/:id/approve etc)
import applicationRoutes, { appRouter as applicationActionsRouter } from './routes/application.routes.js';

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

// mount routes (no duplicates)
app.use('/api/auth', authRoutes);

// shift routes (existing shift endpoints)
app.use('/api/shifts', shiftRoutes);

// shift-scoped application listing: GET /api/shifts/:shiftId/applications
app.use('/api/shifts', applicationRoutes);

// application action endpoints: POST /api/applications/:id/approve etc
app.use('/api/applications', applicationActionsRouter);

// health
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// start
const port = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(port, () => console.log(`API running on :${port}`));
}).catch(err => {
  console.error('Failed to connect DB', err);
  process.exit(1);
});
