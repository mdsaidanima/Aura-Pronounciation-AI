const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test user authentication token (reuse from earlier tests)
const API_BASE = 'http://localhost:5000/api';

async function authenticateTestUser() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    return response.data.token;
  } catch (error) {
    console.log('❌ Authentication failed. User might not exist. Creating user...');
    try {
      const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      return signupResponse.data.token;
    } catch (signupError) {
      console.error('Failed to create test user:', signupError.response?.data || signupError.message);
      throw signupError;
    }
  }
}

async function testUploadEndpoint() {
  console.log('=== UPLOAD ENDPOINT TESTING ===\\n');

  let token;
  try {
    token = await authenticateTestUser();
    console.log('✅ Authentication successful\\n');
  } catch (error) {
    console.log('❌ Authentication failed, cannot test upload endpoint');
    return false;
  }

  const testFiles = [
    { file: './test-short-25s.wav', expected: 'REJECT', reason: 'Too short (25s < 30s)' },
    { file: './test-valid-30s.wav', expected: 'ACCEPT', reason: 'Valid duration (30s)' },
    { file: './test-valid-35s.wav', expected: 'ACCEPT', reason: 'Valid English audio (35s)' },
    { file: './test-long-50s.wav', expected: 'REJECT', reason: 'Too long (50s > 45s)' },
    { file: './test-hindi-audio.wav', expected: 'REJECT', reason: 'Non-English language (Hindi)' },
    { file: './test-spanish-audio.wav', expected: 'REJECT', reason: 'Non-English language (Spanish)' }
  ];

  let passedTests = 0;
  let totalTests = 0;

  for (const test of testFiles) {
    const filePath = path.join(__dirname, test.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${test.file}, skipping...`);
      continue;
    }

    totalTests++;
    
    try {
      console.log(`📤 Testing Upload: ${test.file}`);
      console.log(`   Expected: ${test.expected} - ${test.reason}`);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', fs.createReadStream(filePath));
      formData.append('dpdpConsent', 'true');
      
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });

      // If we get here, the upload was accepted
      if (test.expected === 'ACCEPT') {
        console.log(`   ✅ CORRECTLY ACCEPTED: Upload successful`);
        console.log(`   📊 Report ID: ${response.data._id}`);
        console.log(`   🎯 Overall Score: ${response.data.overallScore}%`);
        passedTests++;
      } else {
        console.log(`   ❌ TEST FAILED: Should have rejected but accepted`);
        console.log(`   📊 Unexpected Report ID: ${response.data._id}`);
      }

    } catch (error) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.message || error.message;
      
      // If we get an error, the upload was rejected
      if (test.expected === 'REJECT') {
        console.log(`   ✅ CORRECTLY REJECTED: ${errorMessage}`);
        console.log(`   📋 Status Code: ${statusCode}`);
        passedTests++;
      } else {
        console.log(`   ❌ TEST FAILED: Should have accepted but rejected`);
        console.log(`   📋 Error: ${errorMessage}`);
        console.log(`   📋 Status Code: ${statusCode}`);
      }
    }
    
    console.log();
  }

  console.log(`=== UPLOAD ENDPOINT TEST RESULTS ===`);
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests && totalTests > 0) {
    console.log(`🎉 ALL UPLOAD VALIDATION TESTS PASSED!`);
    return true;
  } else if (totalTests === 0) {
    console.log(`⚠️  No tests were executed. Check file availability.`);
    return false;
  } else {
    console.log(`⚠️  Some tests failed. Review upload validation logic.`);
    return false;
  }
}

testUploadEndpoint().catch(console.error);