import Shift from '../models/Shift.js';

const isPast = (d) => d.getTime() < Date.now();

export const createShift = async (req, res) => {
  try {
    // Only managers (defense-in-depth; route also guards)
    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

    const {
      title,
      role,
      date,        // optional helper if you send date + startTime/endTime separately
      startTime,   // "HH:mm"
      endTime,     // "HH:mm"
      start,       // OR send full ISO date times directly
      end,
      headcount,
      allowance,
      published = false,
    } = req.body;

    // Build start/end from (date + time) if provided
    const startDt = start
      ? new Date(start)
      : new Date(`${date}T${(startTime || '').padStart(5, '0')}:00`);
    const endDt = end
      ? new Date(end)
      : new Date(`${date}T${(endTime || '').padStart(5, '0')}:00`);

    // Validation
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
      published: Boolean(published),    // allow “create & publish” in one step
      createdBy: req.userId,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create shift' });
  }
};

export const publishShift = async (req, res) => {
  try {
    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });
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

export const listShifts = async (req, res) => {
  try {
    const { published } = req.query;

    // Volunteers only see published shifts (acceptance criterion)
    let filter = {};
    if (req.userRole === 'volunteer') {
      filter.published = true;
    } else if (published === 'true' || published === 'false') {
      filter.published = published === 'true';
    }

    const items = await Shift.find(filter).sort({ start: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to list shifts' });
  }
};
