// backend/models/Announcement.js

import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // We can add 'audience' later (e.g., 'Parents only', 'Students only')
    // For now, all announcements are school-wide.
  },
  {
    timestamps: true,
  }
);

announcementSchema.plugin(mongoosePaginate);
const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;