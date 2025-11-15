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
      type: String, // Cloudinary URL
    },
    cloudinaryPublicId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Graded'],
      default: 'Submitted',
    },
    grade: {
      type: String, // e.g., "A", "85%", "10/10"
    },
    feedback: {
      type: String, // Comments from the teacher
    },
  },
  {
    timestamps: true,
  }
);

// A student can only submit one file per assignment
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;