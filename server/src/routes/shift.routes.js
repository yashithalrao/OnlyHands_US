import { Router } from 'express';
import { createShift, publishShift, listShifts } from '../controllers/shift.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// role guard helper (keeps things explicit)
const requireManager = (req, res, next) => {
  if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  next();
};

router.get('/', requireAuth, listShifts);
router.post('/', requireAuth, requireManager, createShift);
router.patch('/:id/publish', requireAuth, requireManager, publishShift);

export default router;
