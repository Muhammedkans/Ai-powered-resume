const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const candidates = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-pro",
  "gemini-1.0-pro"
];

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("-----------------------------------------");
  console.log("🔍 SCANNING FOR WORKING MODELS (Year 2026 Compatible)");
  console.log("-----------------------------------------");

  for (const modelName of candidates) {
    process.stdout.write(`Testing ${modelName.padEnd(25)} ... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Ping");
      const response = await result.response;
      const text = response.text();
      if (text) {
        console.log("✅ ONLINE");
      }
    } catch (e) {
      let msg = e.message.split('\n')[0];
      if (msg.includes("404")) msg = "404 Not Found";
      console.log(`❌ FAILED (${msg})`);
    }
  }
}

findWorkingModel();
