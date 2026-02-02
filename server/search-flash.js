const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const API_KEY = process.env.GEMINI_API_KEY;

async function testRaw() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const models = response.data.models;
    console.log("FLASH MODELS:");
    models.filter(m => m.name.toLowerCase().includes("flash")).forEach(m => console.log(m.name));
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
testRaw();
