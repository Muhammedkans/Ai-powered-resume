import express from 'express';
import { uploadResume } from '../controllers/resumeController';
import { upload } from '../middleware/upload';

const router = express.Router();

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), uploadResume);

export default router;
