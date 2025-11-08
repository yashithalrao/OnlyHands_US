// // server/src/routes/application.routes.js
// import { Router } from 'express';
// import { requireAuth } from '../middleware/auth.js';
// import { applyForShift, listMyApplications } from '../controllers/application.controller.js';

// const router = Router();

// // POST /api/shifts/:shiftId/apply  (we'll mount this router under /api/shifts)
// router.post('/:shiftId/apply', requireAuth, applyForShift);

// // Optional: GET /api/applications/my  (if you prefer to mount separately)
// router.get('/my', requireAuth, listMyApplications);

// export default router;

// server/src/routes/application.routes.js
// server/src/routes/application.routes.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getShiftApplications,
  approveApplication,
  rejectApplication
} from '../controllers/application.controller.js';

const router = Router();

// inline manager guard
const requireManager = (req, res, next) => {
  if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  next();
};

/**
 * Shift-scoped routes (mounted at /api/shifts)
 * GET /api/shifts/:shiftId/applications
 */
router.get('/:shiftId/applications', requireAuth, requireManager, getShiftApplications);

/**
 * Application action routes (we'll export a separate router for these)
 * POST /api/applications/:applicationId/approve
 * POST /api/applications/:applicationId/reject
 */
const appRouter = Router();
appRouter.post('/:applicationId/approve', requireAuth, requireManager, approveApplication);
appRouter.post('/:applicationId/reject', requireAuth, requireManager, rejectApplication);

// Default export for the shift-scoped router, and named export for application actions
export default router;
export { appRouter };
