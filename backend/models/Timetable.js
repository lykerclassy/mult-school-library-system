// backend/models/Timetable.js

import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassLevel',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with 'Teacher' role
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    startTime: {
      type: String, // e.g., "08:00"
      required: true,
    },
    endTime: {
      type: String, // e.g., "08:40"
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same class, day, and time
timetableSchema.index(
  { classLevel: 1, dayOfWeek: 1, startTime: 1 },
  { unique: true }
);

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;