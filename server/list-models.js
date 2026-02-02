const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

async function listModels() {
  try {
    console.log("Using Key:", process.env.GEMINI_API_KEY ? "Yes" : "No");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: listModels is on the genAI instance or requires specific import? 
    // Typically genAI.getGenerativeModel is widely used.
    // There isn't a simple listModels on the client.
    // We can try to use a default model 'gemini-pro' to see if it works.

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Hello");
    console.log("gemini-pro: Success");
  } catch (e) {
    console.log("gemini-pro: Failed", e.message);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello");
    console.log("gemini-1.5-flash: Success");
  } catch (e) {
    console.log("gemini-1.5-flash: Failed", e.message);
  }
}

listModels();
