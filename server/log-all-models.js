const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

async function listAll() {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  try {
    const response = await axios.get(url);
    const models = response.data.models.map(m => ({
      name: m.name,
      methods: m.supportedGenerationMethods
    }));
    fs.writeFileSync('all_models.json', JSON.stringify(models, null, 2));
    console.log("Wrote all_models.json");
  } catch (e) {
    fs.writeFileSync('api_error.json', JSON.stringify(e.response ? e.response.data : e.message, null, 2));
  }
}
listAll();
