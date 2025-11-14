// backend/controllers/quizController.js

import asyncHandler from 'express-async-handler';
import { generateQuiz as generateQuizFromAI } from '../services/aiService.js';
import Quiz from '../models/Quiz.js';

/**
 * @desc    Generate a new AI quiz
 * @route   POST /api/v1/quiz/generate
 * @access  Private (Student)
 */
const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, numQuestions, difficulty } = req.body;
  const userId = req.user._id;
  const schoolId = req.user.school;

  if (!topic || !numQuestions || !difficulty) {
    res.status(400);
    throw new Error('Please provide topic, number of questions, and difficulty');
  }

  // 1. Call the AI service
  const quizData = await generateQuizFromAI(topic, numQuestions, difficulty);

  // 2. Save the generated quiz to the database
  const quiz = new Quiz({
    topic,
    difficulty,
    questions: quizData.questions,
    generatedBy: userId,
    school: schoolId,
  });

  const createdQuiz = await quiz.save();
  res.status(201).json(createdQuiz);
});

/**
 * @desc    Get all quizzes for the logged-in student
 * @route   GET /api/v1/quiz/history
 * @access  Private (Student)
 */
const getQuizHistory = asyncHandler(async (req, res) => {
  const quizzes = await Quiz.find({ generatedBy: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json(quizzes);
});

/**
 * @desc    Get a specific quiz by ID
 * @route   GET /api/v1/quiz/:id
 * @access  Private (Student)
 */
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (!quiz || quiz.generatedBy.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  res.status(200).json(quiz);
});

// We will add submitQuiz logic later
// For now, the student can just take it on the frontend

export { generateQuiz, getQuizHistory, getQuizById };