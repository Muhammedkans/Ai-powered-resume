import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ message: 'Resume text and Job Description are required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert technical interviewer. Based on the following Candidate Resume and Job Description, generate 5 challenging interview questions tailored specifically to this candidate for this role.
      
      Candidate Resume:
      ${resumeText}
      
      Job Description:
      ${jobDescription}
      
      Return the output as a JSON array of strings. Do not include any other text.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up response if AI includes markdown code blocks
    if (text.startsWith("```json")) {
      text = text.replace("```json", "").replace("```", "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    const questions = JSON.parse(text);

    res.status(200).json({ questions });

  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Error generating interview questions', error: (error as Error).message });
  }
};

export const evaluateAnswer = async (req: Request, res: Response) => {
  try {
    const { question, answer, jobDescription } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert interviewer. Evaluate the candidate's answer to the following interview question for a position described in the Job Description.
      
      Question: ${question}
      Candidate Answer: ${answer}
      Job Context: ${jobDescription}
      
      Provide:
      1. A score out of 10.
      2. Strengths of the answer.
      3. Weaknesses or missing points.
      4. A "Model Answer" (how a senior candidate would answer).
      
      Return the output strictly in JSON format with keys: "score", "strengths", "weaknesses", "modelAnswer".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    if (text.startsWith("```json")) {
      text = text.replace("```json", "").replace("```", "").trim();
    } else if (text.startsWith("```")) {
      text = text.replace(/```/g, "").trim();
    }

    const evaluation = JSON.parse(text);

    res.status(200).json({ evaluation });

  } catch (error) {
    console.error('Error evaluating answer:', error);
    res.status(500).json({ message: 'Error evaluating answer', error: (error as Error).message });
  }
};
