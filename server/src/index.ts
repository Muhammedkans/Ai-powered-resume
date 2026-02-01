import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

import resumeRoutes from './routes/resumeRoutes';
import jobRoutes from './routes/jobRoutes';
import interviewRoutes from './routes/interviewRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resume', resumeRoutes);
app.use('/api/job', jobRoutes);
app.use('/api/interview', interviewRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('AI Powered Resume API is running...');
});

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-resume-db';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
