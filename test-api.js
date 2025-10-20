// Simple test script to check the API
const fs = require('fs');

// Create a small test image
const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
fs.writeFileSync('test.png', testImage);

const FormData = require('form-data');
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream('test.png'));
    
    console.log('Testing API...');
    const response = await fetch('http://localhost:3000/api/generate-materials', {
      method: 'POST',
      body: form
    });
    
    console.log('Response status:', response.status);
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
