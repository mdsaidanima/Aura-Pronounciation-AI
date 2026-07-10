const { detectLanguage, transcribeAudio } = require('../services/aiService');
const fs = require('fs');
const path = require('path');

async function testLanguageDetection() {
  console.log('=== LANGUAGE DETECTION TESTING ===\n');
  
  // Test files for language detection (mock mode will use filenames to determine language)
  const testCases = [
    { 
      file: './test-valid-35s.wav', 
      expected: 'en', 
      shouldAccept: true,
      description: 'English audio (default)' 
    },
    { 
      file: './test-hindi-audio.wav', 
      expected: 'hi', 
      shouldAccept: false,
      description: 'Hindi audio (should be rejected)' 
    },
    { 
      file: './test-spanish-audio.wav', 
      expected: 'es', 
      shouldAccept: false,
      description: 'Spanish audio (should be rejected)' 
    },
    { 
      file: './test-telugu-audio.wav', 
      expected: 'hi', 
      shouldAccept: false,
      description: 'Telugu audio (should be rejected)' 
    }
  ];

  let passedTests = 0;
  let totalTests = 0;

  for (const test of testCases) {
    const filePath = path.join(__dirname, test.file);
    
    // Create test files by copying the valid audio file
    if (test.file !== './test-valid-35s.wav' && !fs.existsSync(filePath)) {
      // Copy existing valid audio file to create language test files
      const sourceFile = path.join(__dirname, './test-valid-35s.wav');
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, filePath);
        console.log(`📋 Created test file: ${test.file}`);
      }
    }

    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${test.file}, skipping...`);
      continue;
    }

    totalTests++;
    
    try {
      console.log(`🌐 Testing Language Detection: ${test.description}`);
      console.log(`   File: ${test.file}`);
      
      // Test language detection
      const detectedLang = await detectLanguage(filePath);
      console.log(`   Detected Language: ${detectedLang}`);
      console.log(`   Expected Language: ${test.expected}`);
      
      // Test if detection matches expectation
      const detectionCorrect = detectedLang === test.expected;
      if (detectionCorrect) {
        console.log(`   ✅ Language Detection: CORRECT`);
      } else {
        console.log(`   ❌ Language Detection: INCORRECT (expected ${test.expected}, got ${detectedLang})`);
      }
      
      // Test transcription with language validation
      try {
        console.log(`   🎯 Testing Transcription with Language Validation...`);
        const transcript = await transcribeAudio(filePath);
        
        if (test.shouldAccept) {
          console.log(`   ✅ Transcription: ACCEPTED (English detected)`);
          console.log(`   📝 Sample transcript: "${transcript.substring(0, 50)}..."`);
          passedTests++;
        } else {
          console.log(`   ❌ TEST FAILED: Should have rejected non-English audio but accepted it`);
          console.log(`   📝 Transcript: "${transcript}"`);
        }
        
      } catch (transcriptionError) {
        if (transcriptionError.message === 'LANGUAGE_NOT_ENGLISH') {
          if (!test.shouldAccept) {
            console.log(`   ✅ Transcription: CORRECTLY REJECTED (Non-English detected)`);
            passedTests++;
          } else {
            console.log(`   ❌ TEST FAILED: Rejected English audio incorrectly`);
          }
        } else {
          console.log(`   ❌ Transcription Error: ${transcriptionError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
    
    console.log();
  }

  console.log(`=== LANGUAGE DETECTION TEST RESULTS ===`);
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests && totalTests > 0) {
    console.log(`🎉 ALL LANGUAGE DETECTION TESTS PASSED!`);
    return true;
  } else if (totalTests === 0) {
    console.log(`⚠️  No tests were executed. Check file availability.`);
    return false;
  } else {
    console.log(`⚠️  Some tests failed. Review language detection logic.`);
    return false;
  }
}

testLanguageDetection().catch(console.error);