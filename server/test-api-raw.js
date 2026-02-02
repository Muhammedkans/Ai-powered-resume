const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testRaw() {
  console.log("Testing with Key:", API_KEY);
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  try {
    const response = await axios.get(url);
    console.log("--- AVAILABLE MODELS ---");
    const names = response.data.models.map(m => m.name);
    console.log(names.join('\n'));
    console.log("------------------------");
  } catch (e) {
    console.log("RAW FETCH FAILED:", e.response ? e.response.status : e.message);
    if (e.response) {
      console.log("RESPONSE BODY:", JSON.stringify(e.response.data, null, 2));
    }
  }
}

testRaw();
