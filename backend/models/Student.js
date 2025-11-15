// backend/models/Student.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

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
    userAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    // --- NEW FIELDS ---
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassLevel',
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to a User with the 'Parent' role
    },
    // --- END NEW FIELDS ---
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ admissionNumber: 1, school: 1 }, { unique: true });
studentSchema.plugin(mongoosePaginate);

const Student = mongoose.model('Student', studentSchema);
export default Student;