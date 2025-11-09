
// import Application from '../models/Application.js';
// import Shift from '../models/Shift.js';
// import User from '../models/User.js';



// export const applyForShift = async (req, res) => {
//   try {
//     const { shiftId } = req.params;
//     const { note = '' } = req.body;

//     // Debug log (optional)
//     console.log('Apply request -> shiftId:', shiftId, 'userId:', req.userId);

//     if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });

//     const shift = await Shift.findById(shiftId);
//     if (!shift) return res.status(404).json({ message: 'Shift not found' });
//     if (!shift.published) return res.status(400).json({ message: 'Cannot apply to unpublished shift' });

//     // Prevent duplicate application
//     const existing = await Application.findOne({ shiftId, userId: req.userId });
//     if (existing) return res.status(400).json({ message: 'Already applied for this shift' });

//     // ✅ Use the correct field names (userId, shiftId)
//     const application = await Application.create({
//       shiftId,
//       userId: req.userId,
//       note,
//       status: 'pending',
//       appliedAt: new Date()
//     });

//     res.status(201).json(application);
//   } catch (err) {
//     console.error('[APPLY ERR]', err);
//     res.status(500).json({ message: err.message || 'Failed to apply for shift' });
//   }
// };

// /**
//  * Manager: list applications for a shift
//  * GET /api/shifts/:shiftId/applications
//  * Optional query ?status=pending|approved|rejected
//  */
// export const getShiftApplications = async (req, res) => {
//   try {
//     const { shiftId } = req.params;
//     const { status } = req.query;

//     const shift = await Shift.findById(shiftId);
//     if (!shift) return res.status(404).json({ message: 'Shift not found' });

//     const filter = { shift: shiftId };
//     if (status) filter.status = status;

//     const apps = await Application.find(filter).populate('volunteer', 'name email');
//     res.json(apps);
//   } catch (err) {
//     console.error('[GET APPS ERR]', err);
//     res.status(500).json({ message: err.message || 'Failed to list applications' });
//   }
// };

// /**
//  * Manager: approve an application
//  * POST /api/applications/:applicationId/approve
//  */
// export const approveApplication = async (req, res) => {
//   try {
//     const { applicationId } = req.params;
//     const app = await Application.findById(applicationId);
//     if (!app) return res.status(404).json({ message: 'Application not found' });
//     if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' });

//     // Optionally check shift headcount etc:
//     const shift = await Shift.findById(app.shift);
//     if (!shift) return res.status(404).json({ message: 'Associated shift not found' });

//     app.status = 'approved';
//     app.reviewedBy = req.userId;
//     app.reviewedAt = new Date();
//     await app.save();

//     // Optionally decrement headcount or track assigned volunteers here

//     res.json(app);
//   } catch (err) {
//     console.error('[APPROVE ERR]', err);
//     res.status(500).json({ message: err.message || 'Failed to approve application' });
//   }
// };

// /**
//  * Manager: reject an application
//  * POST /api/applications/:applicationId/reject
//  */
// export const rejectApplication = async (req, res) => {
//   try {
//     const { applicationId } = req.params;
//     const { reason = '' } = req.body;

//     const app = await Application.findById(applicationId);
//     if (!app) return res.status(404).json({ message: 'Application not found' });
//     if (app.status === 'rejected') return res.status(400).json({ message: 'Already rejected' });

//     app.status = 'rejected';
//     app.reviewedBy = req.userId;
//     app.reviewedAt = new Date();
//     app.rejectionReason = reason;
//     await app.save();

//     res.json(app);
//   } catch (err) {
//     console.error('[REJECT ERR]', err);
//     res.status(500).json({ message: err.message || 'Failed to reject application' });
//   }
// };

// /**
//  * Volunteer: list my applications
//  * GET /api/applications/my
//  */
// export const listMyApplications = async (req, res) => {
//   try {
//     const apps = await Application.find({ volunteer: req.userId }).populate('shift');
//     res.json(apps);
//   } catch (err) {
//     console.error('[MY APPS ERR]', err);
//     res.status(500).json({ message: err.message || 'Failed to list your applications' });
//   }
// };

// server/src/controllers/application.controller.js
import Application from '../models/Application.js';
import Shift from '../models/Shift.js';
import User from '../models/User.js';

/**
 * Volunteer: apply to a shift
 * POST /api/shifts/:shiftId/apply
 */
export const applyForShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { note = '' } = req.body;

    // Debug (optional)
    console.log('applyForShift -> shiftId:', shiftId, 'userId:', req.userId);

    if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    if (!shift.published) return res.status(400).json({ message: 'Cannot apply to unpublished shift' });

    // Prevent duplicate application (schema enforces uniqueness too)
    const existing = await Application.findOne({ shiftId, userId: req.userId });
    if (existing) return res.status(400).json({ message: 'Already applied for this shift' });

    const application = await Application.create({
      shiftId,
      userId: req.userId,
      note,
      status: 'pending',
      appliedAt: new Date()
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('[APPLY ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to apply for shift' });
  }
};

/**
 * Manager: list applications for a shift
 * GET /api/shifts/:shiftId/applications
 * Optional query ?status=pending|approved|rejected|waitlisted
 */
export const getShiftApplications = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status } = req.query;

    // Ensure manager - route might already guard, but double-checking is safe
    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    const filter = { shiftId };
    if (status) filter.status = status;

    // Query by shiftId and populate applicant info (userId)
    const apps = await Application.find(filter)
      .sort({ appliedAt: -1 })
      .populate({ path: 'userId', select: 'name email' })
      .lean();

    // For convenience, return a volunteer field (some frontends expect 'volunteer')
    const transformed = apps.map(a => ({
      ...a,
      volunteer: a.userId,      // populated object or id
      // keep shiftId and userId intact
    }));

    res.json(transformed);
  } catch (err) {
    console.error('[GET APPS ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to list applications' });
  }
};

/**
 * Manager: approve an application
 * POST /api/applications/:applicationId/approve
 */
export const approveApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status === 'approved') return res.status(400).json({ message: 'Already approved' });

    const shift = await Shift.findById(app.shiftId);
    if (!shift) return res.status(404).json({ message: 'Associated shift not found' });

    app.status = 'approved';
    app.reviewedBy = req.userId;
    app.reviewedAt = new Date();
    await app.save();

    res.json(app);
  } catch (err) {
    console.error('[APPROVE ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to approve application' });
  }
};

/**
 * Manager: reject an application
 * POST /api/applications/:applicationId/reject
 */
export const rejectApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason = '' } = req.body;

    const app = await Application.findById(applicationId);
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.status === 'rejected') return res.status(400).json({ message: 'Already rejected' });

    app.status = 'rejected';
    app.reviewedBy = req.userId;
    app.reviewedAt = new Date();
    app.rejectionReason = reason;
    await app.save();

    res.json(app);
  } catch (err) {
    console.error('[REJECT ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to reject application' });
  }
};

/**
 * Volunteer: list my applications
 * GET /api/applications/my
 */
export const listMyApplications = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });

    const apps = await Application.find({ userId: req.userId })
      .sort({ appliedAt: -1 })
      .populate({ path: 'shiftId' })
      .lean();

    // add volunteer=populated user for compatibility if frontend expects it
    res.json(apps.map(a => ({ ...a, volunteer: req.userId })));
  } catch (err) {
    console.error('[MY APPS ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to list your applications' });
  }
};
