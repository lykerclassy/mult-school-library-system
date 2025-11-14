// backend/config/cloudinary.js

import cloudinary from 'cloudinary'; // <-- FIX: Import the v1 default export
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// This config method is for v1
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // Pass the v1 cloudinary object
  params: {
    folder: 'school-library-system',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

export { cloudinary, storage };