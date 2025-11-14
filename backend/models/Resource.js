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
      type: String, // Cloudinary URL
      required: true,
    },
    cloudinaryPublicId: {
      type: String, // For deleting from Cloudinary
      required: true,
    },
    fileType: {
      type: String, // e.g., 'pdf', 'docx'
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['E-book', 'Past Paper', 'Notes', 'Syllabus'],
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
      required: true,
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