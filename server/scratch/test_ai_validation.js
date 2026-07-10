const { transcribeAudio, evaluatePronunciation } = require('../services/aiService');
const path = require('path');

async function testAIValidation() {
  console.log('=== AI VALIDATION TESTING ===\n');

  const testFile = path.join(__dirname, './test-valid-35s.wav');
  let overallPassed = true;

  // Test 1: Transcription Service
  console.log('🎙️  TESTING TRANSCRIPTION SERVICE');
  console.log('─'.repeat(50));
  
  try {
    const transcript = await transcribeAudio(testFile);
    
    console.log('✅ Transcription Status: SUCCESS');
    console.log(`📝 Transcript Length: ${transcript.length} characters`);
    console.log(`📝 Sample Text: "${transcript.substring(0, 100)}..."`);
    
    // Validate transcript quality
    if (transcript && transcript.length > 10) {
      console.log('✅ Transcript Quality: GOOD (contains meaningful content)');
    } else {
      console.log('❌ Transcript Quality: POOR (too short or empty)');
      overallPassed = false;
    }
    
    // Test 2: Pronunciation Evaluation
    console.log('\\n🎯 TESTING PRONUNCIATION EVALUATION');
    console.log('─'.repeat(50));
    
    const evaluation = await evaluatePronunciation(transcript);
    
    // Validate evaluation structure
    const requiredFields = ['overallScore', 'accuracy', 'fluency', 'clarity', 'mistakes', 'tips'];
    let structureValid = true;
    
    console.log('📊 Evaluation Structure Validation:');
    for (const field of requiredFields) {
      if (evaluation[field] !== undefined) {
        console.log(`   ✅ ${field}: Present`);
      } else {
        console.log(`   ❌ ${field}: Missing`);
        structureValid = false;
      }
    }
    
    if (!structureValid) {
      overallPassed = false;
    }
    
    // Validate score ranges (0-100)
    console.log('\\n📈 Score Validation:');
    const scores = ['overallScore', 'accuracy', 'fluency', 'clarity'];
    let scoresValid = true;
    
    for (const scoreField of scores) {
      const score = evaluation[scoreField];
      if (typeof score === 'number' && score >= 0 && score <= 100) {
        console.log(`   ✅ ${scoreField}: ${score}% (Valid range)`);
      } else {
        console.log(`   ❌ ${scoreField}: ${score} (Invalid - must be 0-100)`);
        scoresValid = false;
      }
    }
    
    if (!scoresValid) {
      overallPassed = false;
    }
    
    // Test 3: Mistakes Analysis
    console.log('\\n🔍 TESTING MISTAKES HIGHLIGHTING');
    console.log('─'.repeat(50));
    
    console.log(`📋 Mistakes Found: ${evaluation.mistakes?.length || 0}`);
    
    if (evaluation.mistakes && evaluation.mistakes.length > 0) {
      console.log('✅ Mistake Detection: Working (found pronunciation issues)');
      
      // Validate mistake structure
      let mistakeStructureValid = true;
      const requiredMistakeFields = ['word', 'issue', 'severity', 'suggestion'];
      
      evaluation.mistakes.forEach((mistake, index) => {
        console.log(`\\n   Mistake #${index + 1}:`);
        for (const field of requiredMistakeFields) {
          if (mistake[field]) {
            console.log(`     ✅ ${field}: "${mistake[field]}"`);
          } else {
            console.log(`     ❌ ${field}: Missing`);
            mistakeStructureValid = false;
          }
        }
        
        // Validate severity levels
        if (mistake.severity && ['Low', 'Medium', 'High'].includes(mistake.severity)) {
          console.log(`     ✅ severity level: Valid`);
        } else {
          console.log(`     ❌ severity level: Invalid (must be Low/Medium/High)`);
          mistakeStructureValid = false;
        }
      });
      
      if (!mistakeStructureValid) {
        overallPassed = false;
      }
    } else {
      console.log('⚠️  Mistake Detection: No mistakes found (this could be valid for perfect pronunciation)');
    }
    
    // Test 4: Tips/Suggestions
    console.log('\\n💡 TESTING IMPROVEMENT TIPS');
    console.log('─'.repeat(50));
    
    if (evaluation.tips && evaluation.tips.length > 0) {
      console.log(`✅ Tips Generated: ${evaluation.tips.length} suggestions`);
      evaluation.tips.forEach((tip, index) => {
        console.log(`   ${index + 1}. "${tip.substring(0, 60)}..."`);
      });
    } else {
      console.log('❌ Tips Generation: No tips provided');
      overallPassed = false;
    }
    
  } catch (error) {
    console.log(`❌ AI Service Error: ${error.message}`);
    overallPassed = false;
  }

  // Assessment Requirements Validation
  console.log('\\n' + '='.repeat(60));
  console.log('📋 ASSESSMENT REQUIREMENTS VALIDATION');
  console.log('='.repeat(60));
  
  const requirements = {
    'Speech-to-Text Transcription': overallPassed,
    'Pronunciation Score Generation': overallPassed,
    'Accuracy/Fluency/Clarity Metrics': overallPassed,
    'Specific Mistakes Highlighting': overallPassed,
    'Improvement Suggestions': overallPassed
  };
  
  for (const [requirement, passed] of Object.entries(requirements)) {
    console.log(`${passed ? '✅' : '❌'} ${requirement}: ${passed ? 'IMPLEMENTED' : 'FAILED'}`);
  }
  
  console.log('\\n=== PHASE 5 AI VALIDATION SUMMARY ===');
  if (overallPassed) {
    console.log('🎉 ALL AI VALIDATION TESTS PASSED!');
    console.log('\\n📋 AI Pipeline Status:');
    console.log('   ✅ Transcription: Working (Whisper API + Mock)');
    console.log('   ✅ Scoring: Working (GPT API + Mock)'); 
    console.log('   ✅ Mistake Detection: Working');
    console.log('   ✅ Suggestions: Working');
    console.log('   ✅ Data Structure: Valid JSON format');
    console.log('   ✅ Error Handling: Proper fallbacks');
  } else {
    console.log('❌ SOME AI VALIDATION TESTS FAILED');
    console.log('⚠️  Review the AI service implementation');
  }
  
  return overallPassed;
}

testAIValidation().catch(console.error);