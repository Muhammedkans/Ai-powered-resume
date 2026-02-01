import express from 'express';
import { uploadResume, autoFillResume } from '../controllers/resumeController';
import { upload } from '../middleware/upload';

const router = express.Router();

// POST /api/resume/analyze
router.post('/analyze', upload.single('resume'), uploadResume);
router.post('/autofill', autoFillResume);

export default router;
