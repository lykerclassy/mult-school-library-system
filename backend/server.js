import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import schoolRoutes from './routes/schoolRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import bookRoutes from './routes/bookRoutes.js';

// Import Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Load env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---
app.use(
  cors({
    origin: 'http://localhost:5173', // Your frontend
    credentials: true,
  })
);
app.use(express.json()); // Allow server to accept JSON
app.use(express.urlencoded({ extended: true })); // Allow form data
app.use(cookieParser()); // Parse cookies

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/books', bookRoutes);

// --- Test route ---
app.get('/', (req, res) => {
  res.send('Library Management System API is ready!');
});

// --- Error Handlers (must be last) ---
app.use(notFound);
app.use(errorHandler);

// --- Connect to DB & Start Server (The Bulletproof Way) ---
console.log('Connecting to MongoDB...');
mongoose.set('strictQuery', true);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`🎉 Connected to MongoDB!`);
    
    // Start the server *only after* a successful connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the app if DB connection fails
  });