import { Request, Response } from 'express';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');
import { analyzeResume, generateResumeStructuredData } from '../services/gemini';

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    const data = await pdf(dataBuffer);
    const extractedText = data.text;

    // Analyze with Gemini AI
    console.log("Sending text to Gemini for analysis...");
    const aiAnalysis = await analyzeResume(extractedText);

    // Cleanup: Delete file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      fileName: req.file.filename,
      extractedText: extractedText,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ message: 'Server Error during resume processing', error: (error as Error).message });
  }
};

export const autoFillResume = async (req: Request, res: Response) => {
  try {
    const { rawText } = req.body;
    if (!rawText) return res.status(400).json({ message: 'Raw text is required' });

    const aiData = await generateResumeStructuredData(rawText);
    res.status(200).json(aiData);
  } catch (error) {
    res.status(500).json({ message: 'Auto-fill failed', error: (error as Error).message });
  }
};
