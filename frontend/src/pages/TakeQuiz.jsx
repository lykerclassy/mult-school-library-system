// frontend/src/pages/TakeQuiz.jsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchQuiz = async (quizId) => {
  const { data } = await apiClient.get(`/manual-quiz/student/${quizId}`);
  return data;
};

const submitQuiz = async ({ quizId, answers }) => {
  const { data } = await apiClient.post(`/manual-quiz/${quizId}/submit`, { answers });
  return data;
};

// --- Main Page Component ---
const TakeQuiz = () => {
  const { id } = useParams(); // Get quiz ID from URL
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({}); // Stores { "questionId": "optionId" }
  const [result, setResult] = useState(null); // Stores { score, totalQuestions }

  // Fetch the quiz questions
  const { data: quiz, isLoading } = useQuery({
    queryKey: ['takeQuiz', id],
    queryFn: () => fetchQuiz(id),
  });

  // Mutation for submitting answers
  const mutation = useMutation({
    mutationFn: submitQuiz,
    onSuccess: (data) => {
      setResult(data); // Show the score
      toast.success('Quiz submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    },
  });

  const handleOptionChange = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ quizId: id, answers });
  };

  if (isLoading) return <div>Loading quiz...</div>;

  // --- Show Results Screen ---
  if (result) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
        <p className="text-xl text-gray-600 mb-6">You have completed: {quiz.title}</p>
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-6 rounded-lg shadow-md">
          <p className="text-lg font-semibold">Your Score:</p>
          <p className="text-5xl font-bold my-2">
            {result.score} / {result.totalQuestions}
          </p>
        </div>
        <Button onClick={() => navigate('/manual-quiz')} className="mt-8 w-auto">
          Back to Quizzes
        </Button>
      </div>
    );
  }
  
  // --- Show Quiz Screen ---
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{quiz?.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz?.questions.map((q, index) => (
          <div key={q._id} className="bg-white p-6 rounded-lg shadow">
            <p className="font-semibold text-lg mb-4">
              {index + 1}. {q.questionText}
            </p>
            <div className="space-y-3">
              {q.options.map((opt) => (
                <label
                  key={opt._id}
                  className={`block w-full p-3 border rounded-md cursor-pointer ${
                    answers[q._id] === opt._id ? 'bg-blue-100 border-primary' : 'bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={opt._id}
                    checked={answers[q._id] === opt._id}
                    onChange={() => handleOptionChange(q._id, opt._id)}
                    className="mr-3"
                  />
                  {opt.text}
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
          Submit Quiz
        </Button>
      </form>
    </div>
  );
};

export default TakeQuiz;