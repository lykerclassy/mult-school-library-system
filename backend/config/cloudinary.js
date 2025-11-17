// backend/config/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { currentConfig } from './globalConfigStore.js'; // <-- 1. Import config store

let imageStorage, fileStorage;

/**
 * @desc Initializes Cloudinary config *after* keys are loaded from DB
 */
const initCloudinary = () => {
  // 2. Configure Cloudinary using the global config store
  cloudinary.config({
    cloud_name: currentConfig.cloudinaryCloudName,
    api_key: currentConfig.cloudinaryApiKey,
    api_secret: currentConfig.cloudinaryApiSecret,
  });

  // 3. Define storage *after* config is set
  imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'school-library-system/images',
      allowed_formats: ['jpg', 'png', 'jpeg'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto:good' }
      ]
    },
  });

  fileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'school-library-system/resources',
      resource_type: 'auto',
    },
  });
  
  console.log('Cloudinary has been initialized.');
};

// 4. Export the (currently empty) storage and the init function
export { cloudinary, imageStorage, fileStorage, initCloudinary };