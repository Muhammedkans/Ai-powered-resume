const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

async function testLatest() {
  console.log("Testing gemini-flash-latest...");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Say 'System Online'");
    console.log("RESULT:", result.response.text());
  } catch (e) {
    console.log("FAILED:", e.message);
  }
}
testLatest();
