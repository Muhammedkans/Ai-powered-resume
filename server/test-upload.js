const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

async function testUpload() {
  try {
    // Create a dummy PDF file
    const pdfPath = path.join(__dirname, 'test.pdf');
    fs.writeFileSync(pdfPath, '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Resources <<\n/Font <<\n/F1 <<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\n>>\n>>\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000060 00000 n \n0000000117 00000 n \n0000000286 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n380\n%%EOF');

    const form = new FormData();
    form.append('resume', fs.createReadStream(pdfPath));

    console.log('Sending request to http://localhost:5000/api/resume/analyze...');
    const response = await axios.post('http://localhost:5000/api/resume/analyze', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    console.log('Success:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testUpload();
