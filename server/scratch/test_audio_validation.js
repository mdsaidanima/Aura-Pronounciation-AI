const musicMetadata = require('music-metadata');
const fs = require('fs');
const path = require('path');

async function testAudioFiles() {
  const testFiles = [
    { file: './test-short-25s.wav', expected: 'REJECT', reason: 'Too short (< 30s)' },
    { file: './test-valid-30s.wav', expected: 'ACCEPT', reason: 'Valid duration (30s)' },
    { file: './test-valid-35s.wav', expected: 'ACCEPT', reason: 'Valid duration (35s)' },
    { file: './test-valid-45s.wav', expected: 'ACCEPT', reason: 'Valid duration (45s)' },
    { file: './test-long-50s.wav', expected: 'REJECT', reason: 'Too long (> 45s)' },
  ];

  console.log('=== AUDIO DURATION VALIDATION TESTING ===\n');

  let passedTests = 0;
  let totalTests = testFiles.length;

  for (const test of testFiles) {
    const fullPath = path.join(__dirname, test.file);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${test.file}`);
      continue;
    }

    try {
      const stats = fs.statSync(fullPath);
      console.log(`📁 Testing: ${path.basename(test.file)}`);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      
      const metadata = await musicMetadata.parseFile(fullPath);
      const duration = metadata.format.duration;
      
      console.log(`   Duration: ${duration?.toFixed(2)} seconds`);
      
      // Test validation logic
      let actualResult;
      if (duration < 30) {
        actualResult = 'REJECT';
        console.log(`   ❌ REJECT: Too short (< 30s)`);
      } else if (duration > 45) {
        actualResult = 'REJECT';
        console.log(`   ❌ REJECT: Too long (> 45s)`);
      } else {
        actualResult = 'ACCEPT';
        console.log(`   ✅ ACCEPT: Valid duration (30-45s)`);
      }
      
      // Verify expected vs actual
      if (actualResult === test.expected) {
        console.log(`   ✅ TEST PASSED: ${test.reason}`);
        passedTests++;
      } else {
        console.log(`   ❌ TEST FAILED: Expected ${test.expected}, got ${actualResult}`);
      }
      
      console.log();
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      console.log();
    }
  }
  
  console.log(`=== DURATION VALIDATION TEST RESULTS ===`);
  console.log(`Passed: ${passedTests}/${totalTests} tests`);
  
  if (passedTests === totalTests) {
    console.log(`🎉 ALL DURATION VALIDATION TESTS PASSED!`);
  } else {
    console.log(`⚠️  Some tests failed. Review validation logic.`);
  }
  
  return passedTests === totalTests;
}

testAudioFiles().catch(console.error);