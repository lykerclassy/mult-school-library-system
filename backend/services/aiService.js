// backend/services/aiService.js

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import OpenAI from 'openai';
import { currentConfig } from '../config/globalConfigStore.js'; // <-- Import config store

let openaiClient;
let geminiModel;

// --- CONFIGURE IMMEDIATELY ---
// This file is imported *after* loadConfigFromDB, so config is ready.
try {
  if (currentConfig.openAiKey) {
    openaiClient = new OpenAI({ apiKey: currentConfig.openAiKey });
  }
} catch (e) {
  console.warn('Could not initialize OpenAI, key might be invalid.');
}

try {
  if (currentConfig.googleAiKey) {
    const genAI = new GoogleGenerativeAI(currentConfig.googleAiKey);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }
} catch (e) {
  console.warn('Could not initialize Gemini, key might be invalid.');
}
console.log('AI Services have been configured.');
// ----------------------------

// Getter functions just return the clients
const getOpenAIClient = () => openaiClient;
const getGeminiModel = () => geminiModel;

// --- (Safety settings are unchanged) ---
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- (Internal Generators are unchanged, they use the getter functions) ---
const _generateWithOpenAI = async (prompt) => {
  const openai = getOpenAIClient();
  if (!openai) throw new Error('OpenAI key is not configured.');
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-1106',
    messages: [{ role: 'system', content: prompt }],
    response_format: { type: 'json_object' },
  });
  return JSON.parse(completion.choices[0].message.content);
};

const _generateWithGemini = async (prompt) => {
  const model = getGeminiModel();
  if (!model) throw new Error('Google AI (Gemini) key is not configured.');
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    safetySettings: safetySettings,
  });
  let jsonResponse = result.response.text();
  if (jsonResponse.startsWith('```json')) {
    jsonResponse = jsonResponse.substring(7, jsonResponse.length - 3).trim();
  }
  return JSON.parse(jsonResponse);
};


// --- (Main generateQuiz function is unchanged) ---
const generateQuiz = async (topic, numQuestions = 5, difficulty = 'Medium') => {
  const prompt = `
    You are an expert AI Quiz Generator...
    Example Format:
    {
      "questions": [
        { "question": "...", "options": ["..."], "answer": "A" }
      ]
    }
  `;
  try {
    if (!currentConfig.openAiKey) {
      throw new Error('OpenAI key not provided. Trying fallback.');
    }
    console.log('Attempting quiz generation with OpenAI...');
    const quizData = await _generateWithOpenAI(prompt);
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format from OpenAI');
    }
    console.log('OpenAI successful!');
    return quizData;
  } catch (openAiError) {
    console.warn(`--- OpenAI Failed: ${openAiError.message}`);
    console.log('--- Falling back to Google Gemini... ---');
    try {
      if (!currentConfig.googleAiKey) {
        throw new Error('Google AI key not provided. All providers failed.');
      }
      const quizData = await _generateWithGemini(prompt);
      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Invalid quiz format from Gemini');
      }
      console.log('Gemini successful!');
      return quizData;
    } catch (geminiError) {
      console.error(`--- Gemini also failed: ${geminiError.message}`);
      throw new Error('Both AI providers failed. Please check your API keys.');
    }
  }
};

export { generateQuiz };