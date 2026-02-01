import express from 'express';
import { uploadResume, autoFillResume, createCoverLetter, generateLinkedInProfile } from '../controllers/resumeController';
import { upload } from '../middleware/upload';

const router = express.Router();

// POST /api/resume/analyze
router.post('/analyze', upload.single('resume'), uploadResume);
router.post('/autofill', autoFillResume);
router.post('/cover-letter', createCoverLetter);
router.post('/linkedin-optimize', generateLinkedInProfile);

export default router;
