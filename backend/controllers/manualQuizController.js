// backend/controllers/manualQuizController.js

import asyncHandler from 'express-async-handler';
import ManualQuiz from '../models/ManualQuiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Student from '../models/Student.js';

/**
 * @desc    Create a new manual quiz
 * @route   POST /api/v1/manual-quiz
 * @access  Private (SchoolStaff)
 */
const createManualQuiz = asyncHandler(async (req, res) => {
  const { title, subject, classLevel, questions } = req.body;
  
  if (!title || !questions || questions.length === 0) {
    res.status(400);
    throw new Error('Title and at least one question are required');
  }

  const quiz = await ManualQuiz.create({
    title,
    subject: subject || null,
    classLevel: classLevel || null,
    questions,
    school: req.user.school,
    createdBy: req.user._id,
  });

  res.status(201).json(quiz);
});

/**
 * @desc    Get all quizzes for staff
 * @route   GET /api/v1/manual-quiz
 * @access  Private (SchoolStaff)
 */
const getQuizzesForStaff = asyncHandler(async (req, res) => {
  const quizzes = await ManualQuiz.find({ school: req.user.school })
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ createdAt: -1 });
  
  res.status(200).json(quizzes);
});

/**
 * @desc    Get quizzes for students (filtered)
 * @route   GET /api/v1/manual-quiz/student
 * @access  Private (Student)
 */
const getQuizzesForStudent = asyncHandler(async (req, res) => {
  const quizzes = await ManualQuiz.find({ school: req.user.school })
    .select('-questions.options.isCorrect') // Hide correct answers
    .populate('subject', 'name')
    .populate('classLevel', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json(quizzes);
});

/**
 * @desc    Get a single quiz for a student to take
 * @route   GET /api/v1/manual-quiz/student/:id
 * @access  Private (Student)
 */
const getQuizForStudent = asyncHandler(async (req, res) => {
  const quiz = await ManualQuiz.findById(req.params.id)
    .select('-questions.options.isCorrect'); // Hide correct answers

  if (!quiz || quiz.school.toString() !== req.user.school.toString()) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  res.status(200).json(quiz);
});

/**
 * @desc    Submit a quiz attempt
 * @route   POST /api/v1/manual-quiz/:id/submit
 * @access  Private (Student)
 */
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers } = req.body; // Expects an object like: { "questionId": "optionId" }
  const quizId = req.params.id;
  const userId = req.user._id;

  // 1. Get the full quiz with correct answers
  const quiz = await ManualQuiz.findById(quizId);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // 2. Find the student profile
  const student = await Student.findOne({ userAccount: userId });
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  // 3. Grade the quiz
  let score = 0;
  let totalQuestions = quiz.questions.length;

  for (const question of quiz.questions) {
    const submittedOptionId = answers[question._id.toString()];
    if (submittedOptionId) {
      const selectedOption = question.options.id(submittedOptionId);
      if (selectedOption && selectedOption.isCorrect) {
        score++;
      }
    }
  }

  // 4. Save the attempt
  const attempt = await QuizAttempt.create({
    quiz: quizId,
    student: student._id,
    score,
    totalQuestions,
    school: req.user.school,
  });

  res.status(201).json({
    score,
    totalQuestions,
    attemptId: attempt._id,
  });
});

/**
 * @desc    Get leaderboard
 * @route   GET /api/v1/manual-quiz/leaderboard
 * @access  Private (Student/Staff)
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  // Aggregate all attempts by student and sum their scores
  const leaderboard = await QuizAttempt.aggregate([
    { $match: { school: req.user.school } },
    {
      $group: {
        _id: '$student',
        totalScore: { $sum: '$score' },
      },
    },
    { $sort: { totalScore: -1 } },
    { $limit: 20 },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'studentDetails',
      },
    },
    { $unwind: '$studentDetails' },
    {
      $project: {
        _id: 0,
        name: '$studentDetails.name',
        admissionNumber: '$studentDetails.admissionNumber',
        totalScore: 1,
      },
    },
  ]);

  res.status(200).json(leaderboard);
});

export {
  createManualQuiz,
  getQuizzesForStaff,
  getQuizzesForStudent,
  getQuizForStudent,
  submitQuizAttempt,
  getLeaderboard,
};