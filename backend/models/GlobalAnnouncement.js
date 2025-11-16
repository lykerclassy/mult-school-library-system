// backend/models/GlobalAnnouncement.js

import mongoose from 'mongoose';

const globalAnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The Developer
      required: true,
    },
    // We can add a 'status' like 'draft' or 'published' later
  },
  {
    timestamps: true,
  }
);

const GlobalAnnouncement = mongoose.model('GlobalAnnouncement', globalAnnouncementSchema);
export default GlobalAnnouncement;