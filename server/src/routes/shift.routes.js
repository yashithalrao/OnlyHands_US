import { Router } from 'express';
import { 
  createShift,
  publishShift,
  listShifts,
  completeShift,
  listCompletedShifts       // User Story 7 & History
} from '../controllers/shift.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Manager-only guard
const requireManager = (req, res, next) => {
  if (req.userRole !== 'manager') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// List shifts (volunteers only see published + not completed)
router.get('/', requireAuth, listShifts);

// Create shift
router.post('/', requireAuth, requireManager, createShift);

// Publish shift
router.patch('/:id/publish', requireAuth, requireManager, publishShift);

// View all completed shifts (History)
router.get('/history/all', requireAuth, requireManager, listCompletedShifts);

// Mark shift as completed
router.patch('/:id/complete', requireAuth, requireManager, completeShift);

export default router;
