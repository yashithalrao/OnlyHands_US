// // server/src/controllers/application.controller.js
// import Application from '../models/Application.js';
// import Shift from '../models/Shift.js';

// export const applyForShift = async (req, res) => {
//   try {
//     const { shiftId } = req.params;
//     const userId = req.userId; // from requireAuth middleware

//     // 1) basic validation
//     if (!shiftId) return res.status(400).json({ message: 'shiftId required' });

//     // 2) find shift
//     const shift = await Shift.findById(shiftId);
//     if (!shift) return res.status(404).json({ message: 'Shift not found' });

//     // only published shifts are visible and open for volunteers
//     if (!shift.published) return res.status(400).json({ message: 'Cannot apply to unpublished shift' });

//     // 3) prevent managers from applying (optional safety)
//     if (req.userRole === 'manager') return res.status(403).json({ message: 'Managers cannot apply' });

//     // 4) create application (the model enforces unique user+shift index)
//     let application;
//     try {
//       application = await Application.create({
//         shiftId: shift._id,
//         userId,
//         status: 'pending',
//         appliedAt: new Date(),
//       });
//     } catch (err) {
//       // unique index violation -> user already applied
//       if (err?.code === 11000) {
//         return res.status(409).json({ message: 'You have already applied to this shift' });
//       }
//       throw err;
//     }

//     // 5) update shift status to pending_approval (if not already)
//     if (shift.status !== 'pending_approval') {
//       shift.status = 'pending_approval';
//       await shift.save();
//     }

//     // 6) respond
//     return res.status(201).json({
//       message: 'Application submitted successfully',
//       application,
//       shift: { _id: shift._id, status: shift.status }
//     });
//   } catch (err) {
//     console.error('applyForShift error:', err);
//     return res.status(500).json({ message: err.message || 'Failed to apply' });
//   }
// };

// // Optional: list applications for current user
// export const listMyApplications = async (req, res) => {
//   try {
//     const userId = req.userId;
//     const items = await Application.find({ userId }).populate('shiftId');
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ message: err.message || 'Failed to list applications' });
//   }
// };

// server/src/controllers/application.controller.js
import Application from '../models/Application.js';
import Shift from '../models/Shift.js';
import mongoose from 'mongoose';

/**
 * Helpers
 */

// count approved for a shift
async function countApproved(shiftId) {
  return Application.countDocuments({ shiftId, status: 'approved' });
}

// promote next waitlisted application (FIFO by appliedAt)
// returns the promoted application or null
async function promoteNextWaitlisted(shiftId) {
  // find the oldest waitlisted and atomically update to approved
  const promoted = await Application.findOneAndUpdate(
    { shiftId: mongoose.Types.ObjectId(shiftId), status: 'waitlisted' },
    { $set: { status: 'approved' } },
    { sort: { appliedAt: 1 }, new: true }
  ).populate('userId', 'name email');

  return promoted;
}

/**
 * Controller actions
 */

// GET /api/shifts/:shiftId/applications?status=pending|waitlisted|approved|rejected
export const getShiftApplications = async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status } = req.query;

    // ensure manager only
    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

    const q = { shiftId };
    if (status) q.status = status;

    const items = await Application.find(q)
      .sort({ appliedAt: 1 })
      .populate('userId', 'name email');

    return res.json(items);
  } catch (err) {
    console.error('getShiftApplications err', err);
    return res.status(500).json({ message: err.message || 'Failed to fetch applications' });
  }
};

// POST /api/applications/:applicationId/approve
export const approveApplication = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    if (!mongoose.Types.ObjectId.isValid(appId)) return res.status(400).json({ message: 'Invalid application id' });

    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

    const application = await Application.findById(appId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.status === 'approved') return res.status(400).json({ message: 'Already approved' });
    if (application.status === 'rejected') return res.status(400).json({ message: 'Already rejected' });

    // get shift and capacity
    const shift = await Shift.findById(application.shiftId);
    if (!shift) return res.status(404).json({ message: 'Shift not found' });

    // compute current approved count
    const approvedCount = await countApproved(shift._id);

    if (approvedCount < Number(shift.headcount)) {
      // approve
      application.status = 'approved';
      await application.save();

      // optional: set shift status to pending_approval if it's not set earlier
      if (shift.status !== 'pending_approval') {
        shift.status = 'pending_approval';
        await shift.save();
      }

      return res.json({ message: 'Application approved', application });
    } else {
      // no capacity -> mark this application as waitlisted
      application.status = 'waitlisted';
      await application.save();
      return res.status(200).json({ message: 'Shift full — application waitlisted', application });
    }
  } catch (err) {
    console.error('approveApplication err', err);
    return res.status(500).json({ message: err.message || 'Failed to approve application' });
  }
};

// POST /api/applications/:applicationId/reject
export const rejectApplication = async (req, res) => {
  try {
    const appId = req.params.applicationId;
    if (!mongoose.Types.ObjectId.isValid(appId)) return res.status(400).json({ message: 'Invalid application id' });

    if (req.userRole !== 'manager') return res.status(403).json({ message: 'Forbidden' });

    const application = await Application.findById(appId);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const prevStatus = application.status;

    if (prevStatus === 'rejected') return res.status(400).json({ message: 'Already rejected' });

    // reject
    application.status = 'rejected';
    await application.save();

    let promoted = null;
    // if we removed an approved application, try to promote next waitlisted
    if (prevStatus === 'approved') {
      promoted = await promoteNextWaitlisted(application.shiftId);
    }

    return res.json({
      message: 'Application rejected',
      application,
      promoted // may be null or the promoted application
    });
  } catch (err) {
    console.error('rejectApplication err', err);
    return res.status(500).json({ message: err.message || 'Failed to reject application' });
  }
};

// Optional: manager can list all applications (global) - not necessary now
