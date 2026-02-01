import { Request, Response } from 'express';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');
import { analyzeResume } from '../services/gemini';

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
      extractedText: extractedText.substring(0, 500) + "...",
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Error processing resume:', error);
    res.status(500).json({ message: 'Server Error during resume processing', error: (error as Error).message });
  }
};
