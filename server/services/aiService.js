const fs = require('fs');

// Pre-defined mock transcripts and assessments to deliver high-quality mock data when API keys are omitted.
const mockAssessments = [
  {
    transcript: "I am currently practicing my English pronunciation using an advanced AI platform. My goal is to speak clearly, confidently, and naturally, which will help me in my professional development and global communication.",
    overallScore: 88,
    accuracy: 91,
    fluency: 84,
    clarity: 89,
    mistakes: [
      {
        word: "currently",
        issue: "Omission of the 't' sound or weak syllable stress",
        severity: "Low",
        suggestion: "Ensure the 't' is lightly voiced and the first syllable 'cur' is stressed."
      },
      {
        word: "pronunciation",
        issue: "Incorrect vowel sound in 'nun'",
        severity: "Medium",
        suggestion: "Pronounce the second syllable as 'nun' (rhyming with 'run'), not 'noun'."
      },
      {
        word: "development",
        issue: "Incorrect stress placement",
        severity: "Medium",
        suggestion: "Place the primary stress on the second syllable: de-VEL-op-ment."
      }
    ],
    tips: [
      "Try to link words together to improve your fluency (e.g., 'practicing-my', 'goal-is-to').",
      "Slow down slightly when pronouncing multi-syllable words like 'pronunciation' and 'communication'.",
      "Pay attention to final consonant sounds; ensure the 'd' in 'advanced' is pronounced as a soft 't' sound."
    ]
  },
  {
    transcript: "English is a global language, and mastering its phonetics is a significant milestone. I want to reduce my native accent and improve my intonation and rhythm to express myself more effectively in group meetings.",
    overallScore: 78,
    accuracy: 80,
    fluency: 75,
    clarity: 79,
    mistakes: [
      {
        word: "mastering",
        issue: "Flat vowel sound on 'a'",
        severity: "Low",
        suggestion: "Use a longer /ɑː/ or broader open /æ/ sound for 'mas'."
      },
      {
        word: "significant",
        issue: "Weak articulation of 'g' and ending 't'",
        severity: "Medium",
        suggestion: "Make sure the 'g' is clearly pronounced, and do not drop the final 't'."
      },
      {
        word: "intonation",
        issue: "Flat speech pattern, lack of pitch variation",
        severity: "High",
        suggestion: "Vary your pitch; stress 'ta' in in-to-NA-tion with a rising-falling tone."
      },
      {
        word: "meetings",
        issue: "Voicing 't' too heavily as a hard 'D'",
        severity: "Low",
        suggestion: "In American English, this is a flap T, but keep it light and avoid a heavy 'D' sound."
      }
    ],
    tips: [
      "Practice word stress in key nouns: 'language', 'phonetics', 'milestone'.",
      "Work on stress-timed rhythm: English stress falls on content words (nouns, verbs), while function words are short.",
      "Record yourself reading short paragraphs and compare your pitch contour to native recordings."
    ]
  }
];

/**
 * Detects the language of audio using OpenAI Whisper API.
 * @param {string} filePath Local path to audio file
 * @returns {Promise<string>} Detected language code
 */
const detectLanguage = async (filePath, originalName) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OpenAI API key not configured. Using Mock Language Detection.");
    
    // In mock mode, we can simulate language detection based on filename or content
    // For testing: if filename contains certain keywords, simulate different languages
    const fileName = (originalName || filePath).toLowerCase();
    if (fileName.includes('hindi') || fileName.includes('telugu') || fileName.includes('tamil')) {
      return 'hi'; // Simulate Hindi/Indian languages
    }
    if (fileName.includes('spanish') || fileName.includes('espanol')) {
      return 'es'; // Simulate Spanish
    }
    if (fileName.includes('french') || fileName.includes('francais')) {
      return 'fr'; // Simulate French
    }
    if (fileName.includes('chinese') || fileName.includes('mandarin')) {
      return 'zh'; // Simulate Chinese
    }
    
    // For uploaded files (which get renamed), we can use a simple heuristic:
    // In a real test environment, you would normally have actual non-English audio files
    // For now, default to English to allow testing of the core functionality
    return 'en';
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('file', fileBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    // No language specified - let Whisper detect it

    console.log("Detecting speech language with Whisper API...");
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Whisper API failed with status ${response.status}: ${errText}`);
    }

    const result = await response.json();
    return result.language || 'unknown';
  } catch (error) {
    console.error("Language Detection Error:", error.message);
    throw error;
  }
};

/**
 * Transcribes audio via OpenAI Whisper API (English only).
 * @param {string} filePath Local path to audio file
 * @returns {Promise<string>} Transcribed text
 */
const transcribeAudio = async (filePath, originalName) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  // ALWAYS detect language first, regardless of API key availability
  const detectedLanguage = await detectLanguage(filePath, originalName);
  console.log(`Detected language: ${detectedLanguage}`);

  // Reject if not English
  if (detectedLanguage !== 'en' && detectedLanguage !== 'english') {
    throw new Error('LANGUAGE_NOT_ENGLISH');
  }
  
  if (!apiKey) {
    console.warn("OpenAI API key not configured. Using Mock Transcription (English validated).");
    const randomIndex = Math.floor(Math.random() * mockAssessments.length);
    return mockAssessments[randomIndex].transcript;
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const fileBlob = new Blob([fileBuffer], { type: 'audio/mpeg' });

    const formData = new FormData();
    formData.append('file', fileBlob, 'audio.mp3');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    console.log("Transcribing English audio with Whisper API...");
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Whisper API failed with status ${response.status}: ${errText}`);
    }

    const result = await response.json();
    return result.text;
  } catch (error) {
    console.error("Whisper API Error:", error.message);
    throw error;
  }
};

/**
 * Evaluates transcript via OpenAI GPT API.
 * @param {string} transcript Transcribed text
 * @returns {Promise<object>} Assessment JSON
 */
const evaluatePronunciation = async (transcript) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("OpenAI API key not configured. Using Mock Evaluation.");
    const match = mockAssessments.find(item => item.transcript === transcript) || mockAssessments[0];
    // Return a clone to avoid reference pollution
    return JSON.parse(JSON.stringify(match));
  }

  try {
    console.log("Calling OpenAI GPT for pronunciation evaluation...");
    const systemPrompt = `You are a professional English pronunciation coach and AI speech assessor.
Analyze the user's transcribed English text. Since you only have access to the transcribed text, you should:
1. Identify commonly mispronounced words, sound substitutions, or phonetic challenges in the transcribed sentence.
2. Evaluate readability, grammar coherence, and likely speech fluency based on punctuation, filler words (if any), and phrasing.
3. Provide constructive, specific word-level feedback.
4. Provide structured, actionable tips.

You MUST respond strictly with a JSON object in this format:
{
  "overallScore": 85, // Integer 0-100
  "accuracy": 88,     // Integer 0-100 (accuracy of words/sounds)
  "fluency": 82,      // Integer 0-100 (smoothness, lack of awkward phrasing)
  "clarity": 85,      // Integer 0-100 (understandability)
  "mistakes": [
    {
      "word": "wordname",
      "issue": "Specific phonetic explanation (e.g. incorrect vowel sound, dropped final consonant)",
      "severity": "Low" | "Medium" | "High",
      "suggestion": "How to fix it (e.g. stretch the vowel, emphasize the ending sound)"
    }
  ],
  "tips": [
    "Tip 1...",
    "Tip 2..."
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here is the transcript of my English speech: "${transcript}". Please assess my pronunciation and return the JSON evaluation.` },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GPT API failed with status ${response.status}: ${errText}`);
    }

    const result = await response.json();
    const assessment = JSON.parse(result.choices[0].message.content);
    return assessment;
  } catch (error) {
    console.error("GPT Evaluation Error:", error.message);
    throw error;
  }
};

module.exports = {
  detectLanguage,
  transcribeAudio,
  evaluatePronunciation,
};
