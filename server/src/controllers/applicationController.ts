import { Request, Response } from 'express';
import { JobApplication } from '../models/JobApplication';

export const getApplications = async (req: Request, res: Response) => {
  try {
    const apps = await JobApplication.find().sort({ dateApplied: -1 });
    res.status(200).json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

export const createApplication = async (req: Request, res: Response) => {
  try {
    const newApp = new JobApplication(req.body);
    await newApp.save();
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create application' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedApp = await JobApplication.findByIdAndUpdate(id, { status }, { new: true });
    res.status(200).json(updatedApp);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

export const deleteApplication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await JobApplication.findByIdAndDelete(id);
    res.status(200).json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete application' });
  }
};
