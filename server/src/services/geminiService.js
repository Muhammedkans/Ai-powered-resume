const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

function cleanJsonResponse(text) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) text = jsonMatch[0];
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("AI returned invalid JSON:", text);
    throw new Error("AI response parsing failed. The AI did not return a valid JSON structure.");
  }
}

let activeModelName = "gemini-flash-latest"; // Default for 2026

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("CRITICAL: GEMINI_API_KEY is missing from server/.env.");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: activeModelName });
}

/**
 * SMART WRAPPER
 * Automatically retries with futuristic models if the default returns a 404 error.
 */
async function callGemini(prompt, isVision = false, visionData = null) {
  const modelsToTry = [
    "gemini-1.5-flash", // BEST FOR FREE TIER (High Rate Limits)
    "gemini-1.5-flash-latest",
    "gemini-flash-latest",
    "gemini-1.5-pro",
    "gemini-2.0-flash-exp" // Use experimental only as last resort
  ];

  // If we already found a working model, push it to front
  const index = modelsToTry.indexOf(activeModelName);
  if (index > -1) {
    modelsToTry.splice(index, 1);
    modelsToTry.unshift(activeModelName);
  }

  // Prioritize stable models for Vision/File tasks
  if (isVision) {
    modelsToTry.sort((a, b) => {
      if (a.includes("1.5-flash")) return -1; // Prefer 1.5 Flash for vision
      return 1;
    });
  }

  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`>>> [GEMINI] Trying model: ${modelName}...`);

      // ADDED: Small delay to prevent immediate 429 cascading
      await new Promise(r => setTimeout(r, 1000));

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      let result;
      // RETRY LOGIC for 429 (Quota Exceeded)
      let attempts = 0;
      const maxRetries = 2; // Reduced retries per model to switch faster

      while (attempts <= maxRetries) {
        try {
          if (isVision && visionData) {
            result = await model.generateContent([prompt, visionData]);
          } else {
            result = await model.generateContent(prompt);
          }
          break; // Success!
        } catch (callError) {
          if (callError.message.includes("429") && attempts < maxRetries) {
            attempts++;
            const waitTime = attempts * 2000;
            console.warn(`>>> [GEMINI QUOTA] Hit rate limit on ${modelName}. Waiting ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            throw callError;
          }
        }
      }

      activeModelName = modelName; // Save working model
      console.log(`>>> [GEMINI SUCCESS] Connected to ${modelName}`);
      return result.response.text();
    } catch (error) {
      lastError = error;
      const msg = error.message.split('\n')[0];
      console.error(`>>> [GEMINI ERROR] Model ${modelName} failed:`, msg);

      if (msg.includes("API key not valid")) throw error;

      console.warn(`>>> [GEMINI AUTO-FIX] Switching to next model...`);
      continue;
    }
  }

  console.error(">>> [GEMINI FATAL] All models failed.");
  throw lastError;
}

async function analyzeResume(resumeText) {
  const prompt = `
    You are a World-Class Resume Architect (Top 1% Global Recruiter).
    Your Goal: Analyze this resume, score it ruthlessly, and then provide a structured "Rebuild Plan" to hit a 95+ score.

    Resume Text:
    "${resumeText.substring(0, 15000)}"

    Return JSON:
    {
      "score": number (0-100, extremely strict),
      "percentile": number (1-99, e.g. 45 means 'better than 45% of candidates'),
      "candidateName": "string",
      "summary": "Create a new, high-impact Executive Summary that would get this person hired immediately (max 3 sentences)",
      "strengths": ["List top 3 elite strengths found"],
      "improvements": ["Critical flaw 1", "Critical flaw 2", "Critical flaw 3"],
      "rebuiltContent": {
        "experiencePoints": ["Rewrite their top 3 bullet points to be Google-tier (STAR method, quantified metrics)"],
        "skillsSection": ["The perfect skills list for this profile (add missing modern tech)"]
      },
      "eliteActionPlan": "One specific, genius strategy to double their interview rate instantly."
    }
  `;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

async function analyzeResumeFile(filePath, mimeType) {
  console.log(">>> [GEMINI VISION] Reading file for Inline-Base64 Analysis...");

  try {
    // 1. Read file as Base64
    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    const prompt = `
        You are a Vision-Enhanced ATS System. Deep scan this resume image/PDF.
        
        Return JSON:
        {
          "score": number (0-100, strict),
          "percentile": number (1-99),
          "candidateName": "inferred name",
          "summary": "A fully rewritten, powerful summary based on their visible data",
          "strengths": ["Visual layout rating", "Content structure", "Key skills found"],
          "improvements": ["Formatting issues", "Missing ATS keywords", "Content gaps"],
          "rebuiltContent": {
            "experiencePoints": ["Rewrite top bullet points to be impactful"],
            "skillsSection": ["Optimized skills list"]
          },
          "eliteActionPlan": "What is the #1 thing they must fix visually or content-wise?"
        }
      `;

    // 2. Send directly (No Upload/Wait needed)
    console.log(">>> [GEMINI VISION] Sending Base64 payload...");
    const text = await callGemini(prompt, true, {
      inlineData: {
        data: base64Data,
        mimeType: mimeType
      }
    });

    return cleanJsonResponse(text);
  } catch (e) {
    console.error(">>> [GEMINI VISION FATAL] Base64 Analysis failed:", e);
    throw e;
  }
}

async function matchResumeWithJob(resumeText, jobDescription) {
  const prompt = `
    Act as a Hiring Manager. Compare this Candidate against the Job Description.
    Be brutally honest about the gaps.
    
    RESUME: ${resumeText}
    JD: ${jobDescription}
    
    Return JSON:
    {
      "matchPercentage": number (0-100),
      "matchStatus": "High" | "Medium" | "Low",
      "missingSkills": ["Critical missing tech/skills"],
      "matchingSkills": ["Skills they have"],
      "cultureFitScore": number (1-10),
      "advice": "Strategic advice to get an interview for this specific role."
    }
  `;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

async function generateCoverLetter(resumeText, jobDescription) {
  const prompt = `
    You are an expert Copywriter. Write a compelling, hook-filled Cover Letter for this candidate.
    Tone: Professional, confident, yet humble.
    Highlight the strongest match between Resume and JD.
    resume: ${resumeText} 
    JD: ${jobDescription}
  `;
  return await callGemini(prompt);
}

async function optimizeLinkedIn(resumeText) {
  const prompt = `
    You are a LinkedIn Top Voice. optimize this profile for maximum SEO visibility.
    Resume: ${resumeText}
    
    Return JSON:
    {
      "headline": "A punchy, keyword-rich headline (max 220 chars)",
      "about": "A storytelling-based 'About' section that engages recruiters (first person)"
    }
  `;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

async function generateInterviewQuestions(jobDescription, resumeText) {
  const prompt = `
    Act as a Bar Raiser Interviewer. Generate 5 difficult Technical behavioral/coding questions based on the candidate's specific gaps for this JD.
    JD: ${jobDescription}
    Resume: ${resumeText}
    
    Return JSON: { "questions": ["Q1", "Q2", "Q3", "Q4", "Q5"] }
  `;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

async function evaluateInterviewAnswer(question, answer) {
  const prompt = `
    Evaluate this answer like a Senior Engineer.
    Question: ${question}
    Answer: ${answer}
    
    Return JSON:
    {
      "score": number (1-10),
      "feedback": "Specific technical feedback",
      "improvedAnswer": "The ideal 'Star Method' answer a Staff Engineer would give."
    }
  `;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

async function generateResumeStructuredData(rawText) {
  const prompt = `Convert to JSON resume. Text: ${rawText}`;
  const text = await callGemini(prompt);
  return cleanJsonResponse(text);
}

module.exports = {
  analyzeResume,
  analyzeResumeFile,
  matchResumeWithJob,
  generateCoverLetter,
  optimizeLinkedIn,
  generateResumeStructuredData,
  generateInterviewQuestions,
  evaluateInterviewAnswer
};
