// backend/models/ClassLevel.js

import mongoose from 'mongoose';

const classLevelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // The school this class level belongs to
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
});

// A class name must be unique *per school*
classLevelSchema.index({ name: 1, school: 1 }, { unique: true });

const ClassLevel = mongoose.model('ClassLevel', classLevelSchema);
export default ClassLevel;