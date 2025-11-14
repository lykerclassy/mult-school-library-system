// backend/models/Student.js

import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    admissionNumber: {
      type: String,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    // --- ADD THIS FIELD ---
    // This links the student profile to their login account
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true, // Allows multiple null values but ensures uniqueness once set
    },
    // We'll add more fields later (e.g., form, stream)
  },
  {
    timestamps: true,
  }
);

// Create a compound unique index to ensure admissionNumber is unique *per school*
studentSchema.index({ admissionNumber: 1, school: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;