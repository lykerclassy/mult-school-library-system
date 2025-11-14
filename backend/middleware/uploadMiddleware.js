// backend/middleware/uploadMiddleware.js

import multer from 'multer';
import { storage } from '../config/cloudinary.js';

// Configure multer to use Cloudinary storage
const upload = multer({ storage: storage });

export default upload;