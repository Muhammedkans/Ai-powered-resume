import express from 'express';
import { generateInterviewQuestions, evaluateAnswer } from '../controllers/interviewController';

const router = express.Router();

router.post('/generate', generateInterviewQuestions);
router.post('/evaluate', evaluateAnswer);

export default router;
