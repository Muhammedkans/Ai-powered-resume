import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Interviewing', 'Offered', 'Rejected'],
    default: 'Saved'
  },
  dateApplied: { type: Date, default: Date.now },
  notes: { type: String },
  jobUrl: { type: String },
  matchScore: { type: Number }
});

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
