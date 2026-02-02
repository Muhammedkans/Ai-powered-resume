const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

// Small 1x1 transparent PNG base64
const testImage = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGNiAAAABgADNjd8qAAAAABJRU5ErkJggg==";

const candidates = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro-vision",
  "gemini-1.5-flash-8b"
];

async function checkVision() {
  console.log("-----------------------------------------");
  console.log("👁️ SCANNING FOR VISION-CAPABLE MODELS");
  console.log("-----------------------------------------");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const modelName of candidates) {
    process.stdout.write(`Testing ${modelName.padEnd(25)} with IMAGE ... `);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        "Describe this image",
        { inlineData: { data: testImage, mimeType: "image/png" } }
      ]);
      console.log("✅ WORKS!");
    } catch (e) {
      let msg = e.message.split('\n')[0];
      if (msg.includes("429")) msg = "429 QUOTA";
      if (msg.includes("404")) msg = "404 NOT FOUND";
      console.log(`❌ ${msg}`);
    }
  }
}

checkVision();
