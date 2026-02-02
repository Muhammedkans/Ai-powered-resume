const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testRaw() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const models = response.data.models;
    const flash = models.find(m => m.name.includes("flash"));
    console.log("FLASH FOUND:", flash ? flash.name : "NO FLASH");
    const pro = models.find(m => m.name.includes("pro"));
    console.log("PRO FOUND:", pro ? pro.name : "NO PRO");

    console.log("TOTAL MODELS:", models.length);
    console.log("FIRST 5:", models.slice(0, 5).map(m => m.name));
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
testRaw();
