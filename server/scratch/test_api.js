require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Report = require('../models/Report');
const { evaluatePronunciation } = require('../services/aiService');
const { generateReportPDF } = require('../services/pdfService');

const runTests = async () => {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');

  // Check env
  console.log(`Node Env: ${process.env.NODE_ENV}`);
  console.log(`Mongo URI: ${process.env.MONGODB_URI}`);

  // Test 1: Connect to DB
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔ MongoDB connection verified.');
  } catch (dbError) {
    console.error('✘ MongoDB Connection Failed:', dbError.message);
    console.log('Proceeding with offline tests (Service and PDF validation)...');
  }

  let testUser = null;
  let testReport = null;

  if (mongoose.connection.readyState === 1) {
    try {
      // Test 2: Clean up previous test users/reports
      console.log('Cleaning up previous test records...');
      await User.deleteMany({ email: 'test_engine@aurapronounce.com' });
      
      // Test 3: Create User
      console.log('Testing User creation...');
      testUser = await User.create({
        name: 'Test Engineer',
        email: 'test_engine@aurapronounce.com',
        password: 'password123',
      });
      console.log(`✔ User created successfully: ID = ${testUser._id}`);

      // Verify password hashing
      const fetchedUser = await User.findById(testUser._id).select('+password');
      const isMatch = await fetchedUser.matchPassword('password123');
      console.log(`✔ User password comparison check: ${isMatch ? 'Passed' : 'Failed'}`);

    } catch (modelError) {
      console.error('✘ Model Test Failed:', modelError.message);
    }
  } else {
    // Mock user for offline run
    testUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Offline Test Engineer',
      email: 'test_engine@aurapronounce.com',
    };
  }

  // Test 4: Evaluate AI Mock/Real pipeline
  let evaluation = null;
  try {
    console.log('Testing AI service evaluation...');
    const transcriptText = "I am currently practicing my English pronunciation using an advanced AI platform. My goal is to speak clearly, confidently, and naturally, which will help me in my professional development and global communication.";
    evaluation = await evaluatePronunciation(transcriptText);
    console.log('✔ AI service successfully returned structured response.');
    console.log(`Overall Score: ${evaluation.overallScore}`);
    console.log(`Mistakes Flagged: ${evaluation.mistakes.length}`);
  } catch (aiError) {
    console.error('✘ AI Service Evaluation Failed:', aiError.message);
  }

  // Test 5: PDF Generation
  try {
    console.log('Testing PDF generation service...');
    
    // Create mock report document structure
    const mockReportDoc = {
      _id: new mongoose.Types.ObjectId(),
      transcript: "I am currently practicing my English pronunciation using an advanced AI platform. My goal is to speak clearly, confidently, and naturally, which will help me in my professional development and global communication.",
      audioDuration: 35,
      overallScore: evaluation ? evaluation.overallScore : 88,
      accuracy: evaluation ? evaluation.accuracy : 91,
      fluency: evaluation ? evaluation.fluency : 84,
      clarity: evaluation ? evaluation.clarity : 89,
      mistakes: evaluation ? evaluation.mistakes : [
        { word: 'currently', issue: 'Weak vowel sound', severity: 'Low', suggestion: 'Stress the first syllable' },
        { word: 'development', issue: 'Wrong syllable stress', severity: 'Medium', suggestion: 'Stress second syllable de-VEL' }
      ],
      tips: evaluation ? evaluation.tips : [
        'Practice slowing down on multi-syllable terms.',
        'Link consonants between adjacent words.'
      ],
      createdAt: new Date(),
    };

    const pdfBuffer = await generateReportPDF(mockReportDoc, testUser);
    
    // Write report locally to verify layout
    const localPdfPath = path.join(__dirname, 'sample_report.pdf');
    fs.writeFileSync(localPdfPath, pdfBuffer);
    console.log(`✔ PDF compiled successfully and saved to: ${localPdfPath}`);
  } catch (pdfError) {
    console.error('✘ PDF Generation Failed:', pdfError.message);
  }

  // Close mongoose connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
  console.log('--- INTEGRATION TESTS COMPLETED ---');
};

runTests();
