const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModel(modelName) {
    console.log(`\nTesting Model: ${modelName}...`);
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello?");
        console.log(`✅ ${modelName} WORKED! Response: ${result.response.text()}`);
        return true;
    } catch (e) {
        console.log(`❌ ${modelName} FAILED: ${e.message.split('\n')[0]}`);
        if (e.message.includes("404")) console.log("   (404 implies model name invalid or not accessbile)");
        return false;
    }
}

async function checkFileUpload() {
    console.log(`\nTesting File Upload endpoint...`);
    try {
        const fileManager = new GoogleAIFileManager(API_KEY);
        // Create dummy file
        fs.writeFileSync("test_diag.txt", "diagnosis");
        const uploadResult = await fileManager.uploadFile("test_diag.txt", { mimeType: "text/plain" });
        console.log(`✅ Upload WORKED! URI: ${uploadResult.file.uri}`);
    } catch (e) {
        console.log(`❌ Upload FAILED: ${e.message}`);
    }
}

async function runDiagnosis() {
    console.log("=== GEMINI DIAGNOSIS TOOL ===");
    if (!API_KEY) {
        console.error("❌ NO API KEY FOUND in .env");
        return;
    }
    console.log("API Key present (starts with " + API_KEY.substring(0, 4) + "...)");

    await checkModel("gemini-1.5-flash");
    await checkModel("gemini-1.5-pro");
    await checkModel("gemini-pro");
    await checkModel("gemini-2.0-flash-exp");

    await checkFileUpload();
    console.log("=== END DIAGNOSIS ===");
}

runDiagnosis();
