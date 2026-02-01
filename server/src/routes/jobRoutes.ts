import express from 'express';
import { analyzeJobMatch } from '../controllers/jobController';

const router = express.Router();

router.post('/match', analyzeJobMatch);

export default router;
