const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const candidates = [
  "gemini-2.0-flash-lite-preview-02-05", // Try lite
  "gemini-2.0-flash-exp",
  "gemini-exp-1206",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro",
  "gemini-1.0-pro-001"
];

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("-----------------------------------------");
  console.log("🔍 SEEKING ALTERNATIVE MODELS...");
  console.log("-----------------------------------------");

  for (const modelName of candidates) {
    process.stdout.write(`Testing ${modelName.padEnd(35)} ... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Ping");
      const response = await result.response;
      if (response.text()) {
        console.log("✅ ONLINE");
      }
    } catch (e) {
      let msg = e.message.split('\n')[0];
      if (msg.includes("429")) msg = "429 QUOTA EXCEEDED";
      if (msg.includes("404")) msg = "404 NOT FOUND";
      console.log(`❌ ${msg}`);
    }
  }
}

findWorkingModel();
