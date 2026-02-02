import { Request, Response } from 'express';
// import { GoogleGenerativeAI } from '@google/generative-ai'; // Removed to avoid 'gr' crash
// import dotenv from 'dotenv';
// dotenv.config();

const { generateInterviewQuestions: serviceGenerateQuestions, evaluateInterviewAnswer: serviceEvaluateAnswer } = require('../services/geminiService');

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({ message: 'Job Description is required' });
    }

    // Call pure JS service
    // Note: service currently accepts (jobDescription), we invoke it as such. 
    // If resumeText is needed later, update service.
    const result = await serviceGenerateQuestions(jobDescription, resumeText);

    // Result is expected to be { questions: [] } or fallback
    res.status(200).json(result);

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Error generating interview questions', error: (error as Error).message });
  }
};

export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const { question, answer, jobDescription } = req.body;

    // Call pure JS service
    const evaluation = await serviceEvaluateAnswer(question, answer); // update signature if context needed

    res.status(200).json({ evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ message: 'Error evaluating answer', error: (error as Error).message });
  }
};
