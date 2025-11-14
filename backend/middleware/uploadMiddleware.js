// backend/middleware/uploadMiddleware.js

import multer from 'multer';
import { imageStorage, fileStorage } from '../config/cloudinary.js';

// Uploader for images
const imageUpload = multer({ storage: imageStorage });

// Uploader for general files
const fileUpload = multer({ storage: fileStorage });

export { imageUpload, fileUpload };