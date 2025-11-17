import Shift from '../models/Shift.js';
import Application from '../models/Application.js';   // ✅ required for User Story 7

const isPast = (d) => d.getTime() < Date.now();

/**
 * Create a shift
 */
export const createShift = async (req, res) => {
  try {
    if (req.userRole !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const {
      title,
      role,
      date,
      startTime,
      endTime,
      start,
      end,
      headcount,
      allowance,
      published = false,
    } = req.body;

    const startDt = start
      ? new Date(start)
      : new Date(`${date}T${(startTime || '').padStart(5, '0')}:00`);

    const endDt = end
      ? new Date(end)
      : new Date(`${date}T${(endTime || '').padStart(5, '0')}:00`);

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' });
    if (!role?.trim()) return res.status(400).json({ message: 'Role is required' });
    if (Number(headcount) < 1) return res.status(400).json({ message: 'Headcount must be ≥ 1' });
    if (Number(allowance) < 0) return res.status(400).json({ message: 'Allowance must be ≥ 0' });

    if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime())) {
      return res.status(400).json({ message: 'Invalid start/end datetime' });
    }

    if (isPast(startDt)) return res.status(400).json({ message: 'Start cannot be in the past' });
    if (endDt <= startDt) return res.status(400).json({ message: 'End must be after start' });

    const doc = await Shift.create({
      title: title.trim(),
      role: role.trim(),
      start: startDt,
      end: endDt,
      headcount: Number(headcount),
      allowance: Number(allowance),
      published: Boolean(published),
      createdBy: req.userId,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create shift' });
  }
};

/**
 * Publish shift
 */
export const publishShift = async (req, res) => {
  try {
    if (req.userRole !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;

    const updated = await Shift.findByIdAndUpdate(
      id,
      { $set: { published: true } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Shift not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to publish shift' });
  }
};

/**
 * List shifts
 */
export const listShifts = async (req, res) => {
  try {
    const { published } = req.query;

    let filter = {};

    if (req.userRole === 'volunteer') {
      filter.published = true;
      filter.status = { $ne: 'completed' };  // ✅ Volunteers don't see completed shifts
    } else if (published === 'true' || published === 'false') {
      filter.published = published === 'true';
    }

    const items = await Shift.find(filter).sort({ start: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list shifts' });
  }
};

/**
 * Mark shift as completed (User Story 7)
 */
export const completeShift = async (req, res) => {
  try {
    if (req.userRole !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { id } = req.params;

    const shift = await Shift.findById(id);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    shift.status = 'completed';
    await shift.save();

    await Application.updateMany(
      { shiftId: id },
      { $set: { status: 'completed' } }
    );

    res.json({
      message: 'Shift marked as completed',
      shift,
    });
  } catch (err) {
    console.error('[COMPLETE SHIFT ERR]', err);
    res.status(500).json({ message: 'Failed to complete shift' });
  }
};

export const listCompletedShifts = async (req, res) => {
  try {
    if (req.userRole !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Find all completed shifts
    const shifts = await Shift.find({ status: 'completed' })
      .sort({ end: -1 })
      .lean();

    // Count volunteers for each shift
    const shiftIds = shifts.map(s => s._id);

    const counts = await Application.aggregate([
      { $match: { shiftId: { $in: shiftIds } } },
      { $group: { _id: "$shiftId", count: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    // Attach counts
    const result = shifts.map(s => ({
      ...s,
      volunteerCount: countMap[s._id] || 0
    }));

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load history' });
  }
};


export const getShiftSummaryReport = async (req, res) => {
  try {
    if (req.userRole !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { from, to } = req.query;

    // Filter only completed shifts
    const filter = { status: 'completed' };

    // Optional date range filter
    if (from || to) {
      filter.end = {};
      if (from) filter.end.$gte = new Date(from);
      if (to) filter.end.$lte = new Date(to);
    }

    // Fetch completed shifts
    const shifts = await Shift.find(filter).sort({ end: -1 }).lean();

    // Aggregate volunteer counts for each shift
    const shiftIds = shifts.map(s => s._id);
    const counts = await Application.aggregate([
      { $match: { shiftId: { $in: shiftIds } } },
      { $group: { _id: "$shiftId", totalVolunteers: { $sum: 1 } } }
    ]);

    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.totalVolunteers; });

    // Attach volunteer counts and return
    const summary = shifts.map(s => ({
      _id: s._id,
      title: s.title,
      role: s.role,
      start: s.start,
      end: s.end,
      status: s.status,
      totalVolunteers: countMap[s._id] || 0
    }));

    res.json(summary);
  } catch (err) {
    console.error('[SUMMARY REPORT ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to load summary report' });
  }
};

