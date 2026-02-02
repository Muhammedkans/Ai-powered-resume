const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
  try {
    console.log("API KEY:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "test");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log("Model initialized successfully");

    try {
      const result = await model.generateContent("Say hello");
      console.log("Generation success:", result.response.text());
    } catch (e) {
      console.log("Generation failed (likely invalid key, which is fine):", e.message);
    }
  } catch (e) {
    console.error("CRITICAL ERROR:", e);
  }
}

testGemini();
