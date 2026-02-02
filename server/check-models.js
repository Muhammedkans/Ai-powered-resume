const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function list() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: The library might not expose listModels directly on the main instance 
    // but we can try common ones.
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ ${m} is available`);
      } catch (e) {
        console.log(`❌ ${m}: ${e.message.split('\n')[0]}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
list();
