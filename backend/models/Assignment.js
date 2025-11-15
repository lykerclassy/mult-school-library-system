// backend/models/Assignment.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // User with 'Teacher' role
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
    // We can link to Resources later
    // resources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  },
  {
    timestamps: true,
  }
);

assignmentSchema.plugin(mongoosePaginate);
const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;