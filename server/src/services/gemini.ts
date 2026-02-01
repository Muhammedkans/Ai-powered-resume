import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const analyzeResume = async (resumeText: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  const prompt = `
    You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
    Analyze the following resume text and provide a JSON response. 
    Do NOT return markdown formatting, just pure JSON.
    
    Resume Text:
    "${resumeText.substring(0, 10000)}" // Limit text to avoid token limits if necessary

    Return the response in this exact JSON structure:
    {
      "score": number (0-100),
      "candidateName": "inferred name",
      "summary": "2 sentence professional summary",
      "strengths": ["skill1", "skill2", ...],
      "improvements": [
        "Specific advice 1",
        "Specific advice 2"
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Deep clean JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw new Error("Failed to analyze resume with AI. Check API Key or Content.");
  }
};

export const matchResumeWithJob = async (resumeText: string, jobDescription: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  const prompt = `
    You are an expert Technical Recruiter and Hiring Manager.
    Compare the following Resume against the Job Description (JD).
    
    RESUME:
    "${resumeText.substring(0, 5000)}"

    JOB DESCRIPTION:
    "${jobDescription.substring(0, 5000)}"

    Provide a JSON response with this matching analysis:
    {
      "matchPercentage": number (0-100),
      "matchStatus": "High" | "Medium" | "Low",
      "missingSkills": ["skill1", "skill2"],
      "matchingSkills": ["skill1", "skill2"],
      "cultureFitScore": number (0-10),
      "advice": "Detailed advice on how to convert this application into an interview."
    }
    
    Do NOT return markdown. Just clean JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Job Match Error:", error);
    throw new Error("Failed to compare resume with job");
  }
};
export const generateResumeStructuredData = async (rawText: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in .env file");
  }

  const prompt = `
    You are an expert Resume Writer. Extract structured data from the following raw text or old resume content.
    
    RAW CONTENT:
    "${rawText.substring(0, 8000)}"

    Return a JSON object exactly in this format (ensure all fields are strings or arrays as shown):
    {
      "personal": {
        "fullName": "name",
        "email": "email",
        "phone": "phone",
        "linkedin": "url",
        "github": "url",
        "website": "url",
        "summary": "professional summary"
      },
      "experience": [
        { "id": 1, "role": "role", "company": "company", "date": "duration", "description": "bullet points" }
      ],
      "education": [
        { "id": 1, "degree": "degree", "school": "institution", "date": "year" }
      ],
      "skills": ["Skill 1", "Skill 2"],
      "projects": [
        { "id": 1, "title": "title", "link": "url", "description": "impact" }
      ]
    }
    
    If data is missing, use empty strings. Do not invent details, but clean up grammar.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AutoFill Error:", error);
    throw new Error("Failed to structure resume data");
  }
};
