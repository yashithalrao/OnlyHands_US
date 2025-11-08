// server/src/models/Application.js
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    shiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'waitlisted'],
      default: 'pending',
      required: true
    },
    note: { type: String }, // optional message from volunteer
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// prevent duplicate application by same user for the same shift
applicationSchema.index({ shiftId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
