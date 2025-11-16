// backend/models/Submission.js

import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    submittedOn: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
    },
    cloudinaryPublicId: {
      type: String,
    },
    // --- NEW FIELD ---
    originalFilename: {
      type: String,
    },
    // --- END NEW FIELD ---
    status: {
      type: String,
      enum: ['Submitted', 'Graded'],
      default: 'Submitted',
    },
    grade: {
      type: String,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;