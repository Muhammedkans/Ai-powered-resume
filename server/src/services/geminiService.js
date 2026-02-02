const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const dotenv = require('dotenv');

dotenv.config();

function getModel() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ CRITICAL: GEMINI_API_KEY is not set in .env file!");
    throw new Error("GEMINI_API_KEY is missing");
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function analyzeResume(resumeText) {
  const prompt = `
    You are an expert ATS (Applicant Tracking System) and Technical Recruiter.
    Analyze the following resume text and provide a JSON response. 
    Do NOT return markdown formatting, just pure JSON.
    
    Resume Text:
    "${resumeText.substring(0, 10000)}"

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
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    throw new Error("Failed to analyze resume with AI.");
  }
}

async function analyzeResumeFile(filePath, mimeType) {
  console.log(">>> [GEMINI] Uploading file for vision analysis:", filePath);
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

  try {
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: "Resume File",
    });

    console.log(`>>> [GEMINI] File uploaded: ${uploadResult.file.uri}`);

    const prompt = `
        You are an expert ATS. Analyze this resume document (which may be an image or PDF).
        Extract details and provide a JSON response.
        Do NOT return markdown formatting, just pure JSON.
        
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

    const result = await getModel().generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    const response = await result.response;
    let text = response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];

    // Cleanup? File deletion logic could be added here/later
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini File Analysis Error:", error);
    throw new Error("Failed to analyze resume file with AI.");
  }
}

async function matchResumeWithJob(resumeText, jobDescription) {
  const prompt = `
    You are an expert Technical Recruiter.
    Compare the following Resume against the Job Description (JD).
    
    RESUME: "${resumeText.substring(0, 5000)}"
    JOB DESCRIPTION: "${jobDescription.substring(0, 5000)}"

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
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Job Match Error:", error);
    throw new Error("Failed to compare resume with job");
  }
}

async function generateCoverLetter(resumeText, jobDescription) {
  const prompt = `
    You are an expert Career Coach. Write a professional Cover Letter.
    RESUME: "${resumeText.substring(0, 3000)}"
    JOB DESCRIPTION: "${jobDescription.substring(0, 3000)}"
    Return ONLY the body of the letter.
  `;
  try {
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Gemini Cover Letter Error:", error);
    throw new Error("Failed to generate cover letter");
  }
}

async function optimizeLinkedIn(resumeText) {
  const prompt = `
    You are a LinkedIn Branding Expert. Generate LinkedIn content.
    RESUME: "${resumeText.substring(0, 5000)}"
    Return JSON: { "headline": "", "about": "", "experience": [{"company":"", "bulletPoints":""}], "skills": [] }
    Return ONLY clean JSON.
  `;
  try {
    const result = await getModel().generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini LinkedIn Error:", error);
    throw new Error("Failed to optimize LinkedIn profile");
  }
}

async function generateResumeStructuredData(rawText) {
  // Placeholder simplicity
  return { personal: { fullName: "Parsing..." } };
}

module.exports = {
  analyzeResume,
  analyzeResumeFile,
  matchResumeWithJob,
  generateCoverLetter,
  optimizeLinkedIn,
  generateResumeStructuredData
};
