const pdfParse = require('pdf-parse');

async function parsePDF(dataBuffer) {
  try {
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("PDF Parse Error in Service:", error);
    throw new Error("Failed to parse PDF file.");
  }
}

module.exports = { parsePDF };
