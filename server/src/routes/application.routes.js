
// import { Router } from 'express';
// import { requireAuth } from '../middleware/auth.js';
// import {
//   getShiftApplications,
//   approveApplication,
//   rejectApplication
// } from '../controllers/application.controller.js';

// const router = Router();

// // inline manager guard
// const requireManager = (req, res, next) => {
//   if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });
//   next();
// };

// /**
//  * Shift-scoped routes (mounted at /api/shifts)
//  * GET /api/shifts/:shiftId/applications
//  */
// router.get('/:shiftId/applications', requireAuth, requireManager, getShiftApplications);

// /**
//  * Application action routes (we'll export a separate router for these)
//  * POST /api/applications/:applicationId/approve
//  * POST /api/applications/:applicationId/reject
//  */
// const appRouter = Router();
// appRouter.post('/:applicationId/approve', requireAuth, requireManager, approveApplication);
// appRouter.post('/:applicationId/reject', requireAuth, requireManager, rejectApplication);

// // Default export for the shift-scoped router, and named export for application actions
// export default router;
// export { appRouter };
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getShiftApplications,
  approveApplication,
  rejectApplication,
  applyForShift,            // ✅ import this
  listMyApplications        // optional if you want "My Applications"
} from '../controllers/application.controller.js';

const router = Router();

// ✅ Volunteers apply to a shift
router.post('/:shiftId/apply', requireAuth, applyForShift);

// Manager routes
const requireManager = (req, res, next) => {
  if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  next();
};

router.get('/:shiftId/applications', requireAuth, requireManager, getShiftApplications);

const appRouter = Router();
appRouter.post('/:applicationId/approve', requireAuth, requireManager, approveApplication);
appRouter.post('/:applicationId/reject', requireAuth, requireManager, rejectApplication);

export default router;
export { appRouter };
