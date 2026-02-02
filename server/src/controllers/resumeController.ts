import { Request, Response } from 'express';
import fs from 'fs';
// import { analyzeResume, generateResumeStructuredData, generateCoverLetter, optimizeLinkedIn } from '../services/gemini';
const { analyzeResume, analyzeResumeFile, generateResumeStructuredData, generateCoverLetter, optimizeLinkedIn } = require('../services/geminiService');

export const uploadResume = async (req: Request, res: Response) => {
  console.log(">>> [UPLOAD] Request received at /api/resume/analyze");
  console.log(">>> [UPLOAD] Request received at /api/resume/analyze");
  try {
    console.log(">>> [UPLOAD] Checking req.file...");
    if (req.file) {
      console.log(`>>> [UPLOAD] File detected: ${req.file.originalname} (${req.file.size} bytes)`);
      console.log(`>>> [UPLOAD] Path: ${req.file.path}`);
    } else {
      console.log(">>> [UPLOAD] req.file is UNDEFINED");
    }
  } catch (err) {
    console.error(">>> [UPLOAD] Error logging file info:", err);
  }

  try {
    if (!req.file) {
      console.warn(">>> [UPLOAD] No file found in request!");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const dataBuffer = fs.readFileSync(filePath);
    console.log(`Processing file: ${filePath}, Buffer size: ${dataBuffer.length}`);

    // Parse PDF
    console.log(">>> [PDF] Parsing with pdfService...");
    const { parsePDF } = require('../services/pdfService');
    let extractedText = "";

    try {
      extractedText = await parsePDF(dataBuffer);
      console.log(">>> [PDF] Parsed text length:", extractedText?.length || 0);
    } catch (e) {
      console.warn(">>> [PDF] Parsing failed. Will attempt Vision API.", e);
    }

    let aiAnalysis;

    if (!extractedText || extractedText.trim().length < 50) {
      console.log(">>> [PDF] Text insufficient. Attempting Vision API...");
      try {
        aiAnalysis = await analyzeResumeFile(filePath, mimeType);
      } catch (visionError) {
        console.error(">>> [GEMINI] Vision API Failed:", visionError);
        return res.status(400).json({
          message: "Could not read PDF. It appears to be scanned/image-based, and AI analysis failed. Please upload a digital (text-based) PDF."
        });
      }
    } else {
      // Analyze with Gemini AI (Text Mode)
      console.log(">>> [GEMINI] Sending text to Gemini...");
      aiAnalysis = await analyzeResume(extractedText);
    }

    console.log(">>> [GEMINI] Analysis complete.");
    // const extractedText = "MOCK RESUME TEXT";

    // Cleanup: Delete file after processing
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'Resume analyzed successfully',
      fileName: req.file.filename,
      extractedText: extractedText,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error("Error processing resume:", error);
    res.status(500).json({
      message: 'Could not read PDF. Please ensure it is a valid text-based PDF (not scanned).',
      error: (error as Error).message
    });
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


