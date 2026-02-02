const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function testUpload() {
  try {
    console.log("Checking API Key...");
    if (!process.env.GEMINI_API_KEY) throw new Error("No API Key");

    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a dummy image/text file
    const dummyPath = path.resolve("test-gemini.txt");
    fs.writeFileSync(dummyPath, "This is a test resume content.");

    console.log("Uploading file:", dummyPath);
    const uploadResult = await fileManager.uploadFile(dummyPath, {
      mimeType: "text/plain",
      displayName: "Test File"
    });

    console.log(`File uploaded: ${uploadResult.file.uri}`);
    console.log(`MimeType: ${uploadResult.file.mimeType}`);

    console.log("Generating content...");
    const result = await model.generateContent([
      "What is in this file?",
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    console.log("Response:", result.response.text());

  } catch (error) {
    console.error("Test Failed:", error);
  }
}

testUpload();
