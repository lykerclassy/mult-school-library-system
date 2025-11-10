import express from 'express';
import { registerSchool, getSchools } from '../controllers/schoolController.js';

const router = express.Router();

router.post('/register', registerSchool);
router.get('/', getSchools);

export default router;