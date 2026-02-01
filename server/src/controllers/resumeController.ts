import { Request, Response } from 'express';
import fs from 'fs';
import { analyzeResume, generateResumeStructuredData, generateCoverLetter, optimizeLinkedIn } from '../services/gemini';

export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF
    let pdfParser = require('pdf-parse');
    // Handle ES module default export if present
    if (typeof pdfParser !== 'function' && pdfParser.default) {
      pdfParser = pdfParser.default;
    }

    const data = await pdfParser(dataBuffer);
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

export const createCoverLetter = async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume text and Job Description are required' });
    }

    const coverLetter = await generateCoverLetter(resumeText, jobDescription);
    res.status(200).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: 'Cover letter generation failed', error: (error as Error).message });
  }
};

export const generateLinkedInProfile = async (req: Request, res: Response) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) return res.status(400).json({ message: 'Resume text is required' });

    const linkedInData = await optimizeLinkedIn(resumeText);
    res.status(200).json(linkedInData);
  } catch (error) {
    res.status(500).json({ message: 'LinkedIn optimization failed', error: (error as Error).message });
  }
};


