// backend/models/ManualQuiz.js

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true, default: false },
    },
  ],
});

const manualQuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    classLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassLevel',
    },
    questions: [questionSchema],
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ManualQuiz = mongoose.model('ManualQuiz', manualQuizSchema);
export default ManualQuiz;