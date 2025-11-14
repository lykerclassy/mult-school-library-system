// backend/services/aiService.js

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// --- START FINAL FIX ATTEMPT ---

// 1. Change model to the latest flagship model: 'gemini-1.5-pro-latest'
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest',
  // 2. We keep the generationConfig removed.
});

// --- END FIX ---


// Safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generates a multiple-choice quiz using Google Gemini
 * @param {string} topic - The subject or topic for the quiz
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} difficulty - e.g., 'Easy', 'Medium', 'Hard'
 * @returns {object} - The structured JSON quiz
 */
const generateQuiz = async (topic, numQuestions = 5, difficulty = 'Medium') => {
  const prompt = `
    You are an expert AI Quiz Generator for Kenyan secondary school students.
    Generate a multiple-choice quiz based on the following parameters:
    Topic: ${topic}
    Number of Questions: ${numQuestions}
    Difficulty: ${difficulty}

    The response MUST be a valid JSON object with a single key "questions".
    "questions" should be an array of objects.
    Each question object must have the following properties:
    1. "question": A string containing the question text.
    2. "options": An array of 4 strings (A, B, C, D) representing the choices.
    3. "answer": A string containing the correct option (e.g., "A", "B", "C", or "D").

    Example Format:
    {
      "questions": [
        {
          "question": "What is the capital of Kenya?",
          "options": ["Nairobi", "Mombasa", "Kisumu", "Nakuru"],
          "answer": "A"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings: safetySettings,
    });

    const response = result.response;
    let jsonResponse = response.text();
    
    // Clean the response: Gemini might wrap the JSON in ```json ... ```
    if (jsonResponse.startsWith('```json')) {
      jsonResponse = jsonResponse.substring(7, jsonResponse.length - 3).trim();
    }
    
    const quizData = JSON.parse(jsonResponse);

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format received from AI');
    }

    return quizData;
  } catch (error) {
    console.error('Error generating quiz from Google AI:', error);
    // This error will be shown to the user
    throw new Error('Failed to generate AI quiz. The AI might be blocked.');
  }
};

export { generateQuiz };