// backend/models/Subject.js

import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // The school this subject belongs to
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
});

// A subject name must be unique *per school*
subjectSchema.index({ name: 1, school: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;