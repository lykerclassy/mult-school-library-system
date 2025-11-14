// frontend/src/features/quiz/QuizGenerator.jsx

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// --- Components ---

// This component displays the generated quiz
const ActiveQuiz = ({ quizData }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleOptionChange = (questionIndex, option) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: option,
    });
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    // TODO: In a full app, we would save the score and answers
    // to a new 'QuizAttempt' model in the backend.
  };

  let score = 0;
  if (showResults) {
    quizData.questions.forEach((q, index) => {
      const correctOption = q.options.findIndex(
        (opt) => opt[0] === q.answer
      );
      if (userAnswers[index] === q.options[correctOption]) {
        score++;
      }
    });
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Quiz on: {quizData.topic}</h2>
      {showResults && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Quiz Complete!</p>
          <p>
            You scored {score} out of {quizData.questions.length}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {quizData.questions.map((q, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg bg-white shadow-sm"
          >
            <p className="font-semibold mb-3">
              {index + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, optIndex) => {
                const isSelected = userAnswers[index] === option;
                let bgColor = 'bg-white';
                if (showResults) {
                  const isCorrect = option[0] === q.answer;
                  if (isCorrect) {
                    bgColor = 'bg-green-200 border-green-400';
                  } else if (isSelected && !isCorrect) {
                    bgColor = 'bg-red-200 border-red-400';
                  }
                }

                return (
                  <label
                    key={optIndex}
                    className={`block w-full p-3 border rounded-md cursor-pointer ${
                      isSelected && !showResults ? 'bg-blue-100' : ''
                    } ${bgColor}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionChange(index, option)}
                      className="mr-2"
                      disabled={showResults}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {!showResults && (
        <Button onClick={handleSubmitQuiz} className="mt-6">
          Submit Quiz
        </Button>
      )}
    </div>
  );
};

// This component has the form to generate a quiz
const QuizGenerator = () => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [activeQuiz, setActiveQuiz] = useState(null); // Holds the generated quiz data

  const mutation = useMutation({
    mutationFn: (quizParams) => apiClient.post('/quiz/generate', quizParams),
    onSuccess: (data) => {
      toast.success('Quiz generated successfully!');
      setActiveQuiz(data.data); // Set the active quiz
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to generate quiz');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setActiveQuiz(null); // Clear old quiz
    mutation.mutate({ topic, numQuestions, difficulty });
  };

  if (activeQuiz) {
    return <ActiveQuiz quizData={activeQuiz} />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Quiz Generator</h1>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-surface rounded-lg shadow space-y-4 max-w-lg"
      >
        <Input
          label="Topic or Subject"
          id="topic"
          placeholder="e.g. 'Photosynthesis' or 'World War 1'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <Input
          label="Number of Questions"
          id="numQuestions"
          type="number"
          min="3"
          max="10"
          value={numQuestions}
          onChange={(e) => setNumQuestions(Number(e.target.value))}
          required
        />
        <div>
          <label
            htmlFor="difficulty"
            className="block text-sm font-medium text-gray-700"
          >
            Difficulty
          </label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <Button type="submit" isLoading={mutation.isLoading}>
          Generate Quiz
        </Button>
      </form>
    </div>
  );
};

export default QuizGenerator;