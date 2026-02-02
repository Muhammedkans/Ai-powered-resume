const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function testInline() {
  try {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) throw new Error("No API Key");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a dummy text file pretending to be 'pdf' (content doesn't matter for API structure check, though model might complain it's not valid PDF)
    // Better: Use a small valid PDF if possible. Or just text/plain for test.
    const dummyPath = path.resolve("test-inline.txt");
    fs.writeFileSync(dummyPath, "This is a test resume content.");

    const fileData = fs.readFileSync(dummyPath);
    const base64Data = fileData.toString('base64');

    console.log("Generating content with inlineData...");
    const result = await model.generateContent([
      "What is in this file?",
      {
        inlineData: {
          data: base64Data,
          mimeType: "text/plain",
        },
      },
    ]);

    console.log("Response:", result.response.text());

  } catch (error) {
    console.error("Test Failed:", error);
  }
}

testInline();
