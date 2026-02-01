import express from 'express';
import { getApplications, createApplication, updateApplicationStatus, deleteApplication } from '../controllers/applicationController';

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplicationStatus);
router.delete('/:id', deleteApplication);

export default router;
