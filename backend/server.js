// backend/server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { startCronJobs } from './services/cronJobs.js';
import { loadConfigFromDB } from './config/globalConfigStore.js';
import { initEmailService } from './services/emailService.js'; // Import email service

// Load .env variables (ONLY for DB, Port, JWT_SECRET)
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

// --- Core Middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());

// --- NEW ASYNC START FUNCTION ---
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Load the global config from the DB into memory
    await loadConfigFromDB();

    // --- 3. Dynamically import all routes ---
    // (This MUST happen *after* loadConfigFromDB)

    // --- THIS IS THE FIX ---
    // We just import cloudinary.js; it will configure itself
    // We do NOT need to call initCloudinary()
    await import('./config/cloudinary.js');
    // --- END OF FIX ---

    const authRoutes = (await import('./routes/authRoutes.js')).default;
    const schoolRoutes = (await import('./routes/schoolRoutes.js')).default;
    const studentRoutes = (await import('./routes/studentRoutes.js')).default;
    const bookRoutes = (await import('./routes/bookRoutes.js')).default;
    const quizRoutes = (await import('./routes/quizRoutes.js')).default;
    const userRoutes = (await import('./routes/userRoutes.js')).default;
    const transactionRoutes = (await import('./routes/transactionRoutes.js')).default;
    const subjectRoutes = (await import('./routes/subjectRoutes.js')).default;
    const classLevelRoutes = (await import('./routes/classLevelRoutes.js')).default;
    const resourceRoutes = (await import('./routes/resourceRoutes.js')).default;
    const manualQuizRoutes = (await import('./routes/manualQuizRoutes.js')).default;
    const analyticsRoutes = (await import('./routes/analyticsRoutes.js')).default;
    const notificationRoutes = (await import('./routes/notificationRoutes.js')).default;
    const assignmentRoutes = (await import('./routes/assignmentRoutes.js')).default;
    const planRoutes = (await import('./routes/planRoutes.js')).default;
    const announcementRoutes = (await import('./routes/announcementRoutes.js')).default;
    const communicationRoutes = (await import('./routes/communicationRoutes.js')).default;
    const configRoutes = (await import('./routes/configRoutes.js')).default;
    const timetableRoutes = (await import('./routes/timetableRoutes.js')).default;

    // 4. Initialize services that depend on config
    initEmailService();
    
    // --- 5. Use Routes ---
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
    app.use('/api/v1/announcements', announcementRoutes);
    app.use('/api/v1/comm', communicationRoutes);
    app.use('/api/v1/config', configRoutes);
    app.use('/api/v1/timetables', timetableRoutes);
    
    // --- 6. Error Handling ---
    app.use(notFound);
    app.use(errorHandler);
    
    // --- 7. Start Server ---
    app.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
      // 8. Start cron jobs
      startCronJobs();
    });

  } catch (error) {
    console.error('CRITICAL: Failed to start server:', error);
    process.exit(1);
  }
};

// --- START THE SERVER ---
startServer();