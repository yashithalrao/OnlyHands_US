// server/src/controllers/application.controller.js
import Application from '../models/Application.js';
import Shift from '../models/Shift.js';

export const applyForShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const userId = req.userId; // from requireAuth middleware

    // 1) basic validation
    if (!shiftId) return res.status(400).json({ message: 'shiftId required' });

    // 2) find shift
    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // only published shifts are visible and open for volunteers
    if (!shift.published) return res.status(400).json({ message: 'Cannot apply to unpublished shift' });

    // 3) prevent managers from applying (optional safety)
    if (req.userRole === 'manager') return res.status(403).json({ message: 'Managers cannot apply' });

    // 4) create application (the model enforces unique user+shift index)
    let application;
    try {
      application = await Application.create({
        shiftId: shift._id,
        userId,
        status: 'pending',
        appliedAt: new Date(),
      });
    } catch (err) {
      // unique index violation -> user already applied
      if (err?.code === 11000) {
        return res.status(409).json({ message: 'You have already applied to this shift' });
      }
      throw err;
    }

    // 5) update shift status to pending_approval (if not already)
    if (shift.status !== 'pending_approval') {
      shift.status = 'pending_approval';
      await shift.save();
    }

    // 6) respond
    return res.status(201).json({
      message: 'Application submitted successfully',
      application,
      shift: { _id: shift._id, status: shift.status }
    });
  } catch (err) {
    console.error('applyForShift error:', err);
    return res.status(500).json({ message: err.message || 'Failed to apply' });
  }
};

// Optional: list applications for current user
export const listMyApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const items = await Application.find({ userId }).populate('shiftId');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list applications' });
  }
};
