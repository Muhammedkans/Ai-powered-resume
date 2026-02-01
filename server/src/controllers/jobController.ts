import { Request, Response } from 'express';
import { matchResumeWithJob } from '../services/gemini';

export const analyzeJobMatch = async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume text and Job Description are required' });
    }

    console.log("Analyzing Job Match...");
    const matchAnalysis = await matchResumeWithJob(resumeText, jobDescription);

    res.status(200).json({
      message: 'Job analysis complete',
      analysis: matchAnalysis
    });

  } catch (error) {
    console.error('Error analyzing job match:', error);
    res.status(500).json({ message: 'Server Error during job matching', error: (error as Error).message });
  }
};
