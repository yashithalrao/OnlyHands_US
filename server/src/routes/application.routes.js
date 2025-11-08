// server/src/routes/application.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { applyForShift, listMyApplications } from '../controllers/application.controller.js';

const router = Router();

// POST /api/shifts/:shiftId/apply  (we'll mount this router under /api/shifts)
router.post('/:shiftId/apply', requireAuth, applyForShift);

// Optional: GET /api/applications/my  (if you prefer to mount separately)
router.get('/my', requireAuth, listMyApplications);

export default router;
