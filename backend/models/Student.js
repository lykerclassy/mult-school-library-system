// backend/models/Student.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2'; // <-- 1. IMPORT

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
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ admissionNumber: 1, school: 1 }, { unique: true });

studentSchema.plugin(mongoosePaginate); // <-- 2. APPLY PLUGIN

const Student = mongoose.model('Student', studentSchema);
export default Student;