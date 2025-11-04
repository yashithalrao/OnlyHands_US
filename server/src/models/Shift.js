import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },           // e.g., "usher", "registration"
    start: { type: Date, required: true },                        // start datetime
    end: { type: Date, required: true },                          // end datetime
    headcount: { type: Number, required: true, min: 1 },
    allowance: { type: Number, required: true, min: 0 },
    published: { type: Boolean, default: false, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Basic sanity check at DB layer too
shiftSchema.pre('validate', function (next) {
  if (this.start && this.end && this.end <= this.start) {
    return next(new Error('End time must be after start time'));
  }
  next();
});

shiftSchema.index({ start: 1, published: 1 });

export default mongoose.model('Shift', shiftSchema);
