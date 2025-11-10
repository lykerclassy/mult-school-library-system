import express from 'express';
import { loginUser, registerDeveloper, logoutUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register-dev', registerDeveloper);
router.post('/logout', logoutUser);

export default router;