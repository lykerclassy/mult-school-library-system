// backend/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { currentConfig } from './globalConfigStore.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: currentConfig.cloudinaryCloudName,
  api_key: currentConfig.cloudinaryApiKey,
  api_secret: currentConfig.cloudinaryApiSecret,
});
console.log('Cloudinary has been configured.');

// 1. Storage for IMAGES (logos, profile pics)
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-library-system/images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    // --- THIS IS THE FIX ---
    // Auto-convert/resize any uploaded image
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
    ]
    // --- END OF FIX ---
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