const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const candidates = [
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002"
];

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("-----------------------------------------");
  for (const modelName of candidates) {
    process.stdout.write(`Testing ${modelName.padEnd(35)} ... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      await model.generateContent("Ping");
      console.log("✅ ONLINE");
    } catch (e) {
      let msg = e.message.split('\n')[0];
      if (msg.includes("429")) msg = "429 QUOTA";
      if (msg.includes("404")) msg = "404 NOT FOUND";
      console.log(`❌ ${msg}`);
    }
  }
}
findWorkingModel();
