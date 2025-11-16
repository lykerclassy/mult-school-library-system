// backend/models/Resource.js

import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['E-book', 'Past Paper', 'Notes', 'Syllabus', 'Global'], // Added 'Global'
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassLevel',
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: false, // <-- THIS IS THE FIX (was true)
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;