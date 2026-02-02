const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY;

async function check(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hi");
    console.log(`✅ ${modelName} WORKED`);
  } catch (e) {
    console.log(`❌ ${modelName} FAILED: ${e.message.split('\n')[0]}`);
  }
}

async function run() {
  await check("gemini-1.5-flash");
  await check("models/gemini-1.5-flash");
  await check("gemini-1.5-flash-001");
  // Legacy mapping check
  await check("gemini-pro");
}
run();
