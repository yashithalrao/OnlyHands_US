
// // server/src/controllers/application.controller.js
// import Application from '../models/Application.js';
// import Shift from '../models/Shift.js';
// import mongoose from 'mongoose';

// /**
//  * Helpers
//  */

// // count approved for a shift
// async function countApproved(shiftId) {
//   return Application.countDocuments({ shiftId, status: 'approved' });
// }

// // promote next waitlisted application (FIFO by appliedAt)
// // returns the promoted application or null
// async function promoteNextWaitlisted(shiftId) {
//   // find the oldest waitlisted and atomically update to approved
//   const promoted = await Application.findOneAndUpdate(
//     { shiftId: mongoose.Types.ObjectId(shiftId), status: 'waitlisted' },
//     { $set: { status: 'approved' } },
//     { sort: { appliedAt: 1 }, new: true }
//   ).populate('userId', 'name email');

//   return promoted;
// }

// /**
//  * Controller actions
//  */

// // GET /api/shifts/:shiftId/applications?status=pending|waitlisted|approved|rejected
// export const getShiftApplications = async (req, res) => {
//   try {
//     const { shiftId } = req.params;
//     const { status } = req.query;

//     // ensure manager only
//     if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

//     const q = { shiftId };
//     if (status) q.status = status;

//     const items = await Application.find(q)
//       .sort({ appliedAt: 1 })
//       .populate('userId', 'name email');

//     return res.json(items);
//   } catch (err) {
//     console.error('getShiftApplications err', err);
//     return res.status(500).json({ message: err.message || 'Failed to fetch applications' });
//   }
// };

// // POST /api/applications/:applicationId/approve
// export const approveApplication = async (req, res) => {
//   try {
//     const appId = req.params.applicationId;
//     if (!mongoose.Types.ObjectId.isValid(appId)) return res.status(400).json({ message: 'Invalid application id' });

//     if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

//     const application = await Application.findById(appId);
//     if (!application) return res.status(404).json({ message: 'Application not found' });

//     if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });
//     if (application.status === 'rejected') return res.status(400).json({ message: 'Already rejected' });

//     // get shift and capacity
//     const shift = await Shift.findById(application.shiftId);
//     if (!shift) return res.status(404).json({ message: 'Shift not found' });

//     // compute current approved count
//     const approvedCount = await countApproved(shift._id);

//     if (approvedCount < Number(shift.headcount)) {
//       // approve
//       application.status = 'approved';
//       await application.save();

//       // optional: set shift status to pending_approval if it's not set earlier
//       if (shift.status !== 'pending_approval') {
//         shift.status = 'pending_approval';
//         await shift.save();
//       }

//       return res.json({ message: 'Application approved', application });
//     } else {
//       // no capacity -> mark this application as waitlisted
//       application.status = 'waitlisted';
//       await application.save();
//       return res.status(200).json({ message: 'Shift full — application waitlisted', application });
//     }
//   } catch (err) {
//     console.error('approveApplication err', err);
//     return res.status(500).json({ message: err.message || 'Failed to approve application' });
//   }
// };

// // POST /api/applications/:applicationId/reject
// export const rejectApplication = async (req, res) => {
//   try {
//     const appId = req.params.applicationId;
//     if (!mongoose.Types.ObjectId.isValid(appId)) return res.status(400).json({ message: 'Invalid application id' });

//     if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

//     const application = await Application.findById(appId);
//     if (!application) return res.status(404).json({ message: 'Application not found' });

//     const prevStatus = application.status;

//     if (prevStatus === 'rejected') return res.status(400).json({ message: 'Already rejected' });

//     // reject
//     application.status = 'rejected';
//     await application.save();

//     let promoted = null;
//     // if we removed an approved application, try to promote next waitlisted
//     if (prevStatus === 'approved') {
//       promoted = await promoteNextWaitlisted(application.shiftId);
//     }

//     return res.json({
//       message: 'Application rejected',
//       application,
//       promoted // may be null or the promoted application
//     });
//   } catch (err) {
//     console.error('rejectApplication err', err);
//     return res.status(500).json({ message: err.message || 'Failed to reject application' });
//   }
// };

// // Optional: manager can list all applications (global) - not necessary now
// src/controllers/application.controller.js
import Application from '../models/Application.js';
import Shift from '../models/Shift.js';
import User from '../models/User.js';



export const applyForShift = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { note = '' } = req.body;

    // Debug log (optional)
    console.log('Apply request -> shiftId:', shiftId, 'userId:', req.userId);

    if (!req.userId) return res.status(401).json({ message: 'Not authenticated' });

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });
    if (!shift.published) return res.status(400).json({ message: 'Cannot apply to unpublished shift' });

    // Prevent duplicate application
    const existing = await Application.findOne({ shiftId, userId: req.userId });
    if (existing) return res.status(400).json({ message: 'Already applied for this shift' });

    // ✅ Use the correct field names (userId, shiftId)
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
 * Optional query ?status=pending|approved|rejected
 */
export const getShiftApplications = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status } = req.query;

    const shift = await Shift.findById(shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    const filter = { shift: shiftId };
    if (status) filter.status = status;

    const apps = await Application.find(filter).populate('volunteer', 'name email');
    res.json(apps);
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

    // Optionally check shift headcount etc:
    const shift = await Shift.findById(app.shift);
    if (!shift) return res.status(404).json({ message: 'Associated shift not found' });

    app.status = 'approved';
    app.reviewedBy = req.userId;
    app.reviewedAt = new Date();
    await app.save();

    // Optionally decrement headcount or track assigned volunteers here

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
    const apps = await Application.find({ volunteer: req.userId }).populate('shift');
    res.json(apps);
  } catch (err) {
    console.error('[MY APPS ERR]', err);
    res.status(500).json({ message: err.message || 'Failed to list your applications' });
  }
};
