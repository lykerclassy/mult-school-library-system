// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { startCronJobs } from './services/cronJobs.js'; // <-- 1. IMPORT

// --- Import Routes ---
import authRoutes from './routes/authRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import classLevelRoutes from './routes/classLevelRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import manualQuizRoutes from './routes/manualQuizRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import planRoutes from './routes/planRoutes.js';

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5000;

// --- Core Middleware ---
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
// ... (all app.use routes are unchanged) ...
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/schools', schoolRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/manual-quiz', manualQuizRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/subjects', subjectRoutes);
app.use('/api/v1/classes', classLevelRoutes);
app.use('/api/v1/resources', resourceRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/plans', planRoutes);


// --- Error Handling Middleware ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
  
  // --- 2. START CRON JOBS ---
  startCronJobs();
  // -------------------------
});