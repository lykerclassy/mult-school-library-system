// backend/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// --- START DEBUGGING ---
// These logs will print to your backend terminal when the server starts.
// Check if these keys EXACTLY match your new keys from the Cloudinary dashboard.
console.log('--- Cloudinary Config Debug ---');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('API_SECRET (First 5 chars):', process.env.CLOUDINARY_API_SECRET?.substring(0, 5));
console.log('-------------------------------');
// --- END DEBUGGING ---

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 1. Storage for IMAGES (logos, profile pics)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-library-system/images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// 2. Storage for general FILES (ebooks, notes, papers)
const fileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-library-system/resources',
    resource_type: 'auto', 
  },
});

export { cloudinary, imageStorage, fileStorage };