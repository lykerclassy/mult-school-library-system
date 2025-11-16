// frontend/src/pages/TakeQuiz.jsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import DOMPurify from 'dompurify';

// --- (API Functions are unchanged) ---
const fetchQuiz = async (quizId) => {
  const { data } = await apiClient.get(`/manual-quiz/student/${quizId}`);
  return data;
};
const submitQuiz = async ({ quizId, answers }) => {
  const { data } = await apiClient.post(`/manual-quiz/${quizId}/submit`, { answers });
  return data;
};

// --- Main Page Component (UPDATED) ---
const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['takeQuiz', id],
    queryFn: () => fetchQuiz(id),
  });

  const mutation = useMutation({
    mutationFn: submitQuiz,
    onSuccess: (data) => {
      setResult(data);
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

  // --- (Result Screen is unchanged) ---
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
  
  // --- Quiz Screen (UPDATED) ---
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{quiz?.title}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {quiz?.questions.map((q, index) => (
          <div key={q._id} className="bg-white p-6 rounded-lg shadow">
            <div className="font-semibold text-lg mb-4 flex items-start">
              <span className="mr-2">{index + 1}.</span>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.questionText) }}
              />
            </div>
            <div className="space-y-3">
              {q.options.map((opt) => (
                <label
                  key={opt._id}
                  className={`flex items-start w-full p-3 border rounded-md cursor-pointer ${
                    answers[q._id] === opt._id ? 'bg-blue-100 border-primary' : 'bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${q._id}`}
                    value={opt._id}
                    checked={answers[q._id] === opt._id}
                    onChange={() => handleOptionChange(q._id, opt._id)}
                    className="mr-3 mt-1"
                  />
                  {/* --- THIS IS THE FIX --- */}
                  {/* This div "steals" the click. pointer-events-none makes clicks go through it. */}
                  <div
                    className="prose pointer-events-none"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(opt.text) }}
                  />
                  {/* --- END OF FIX --- */}
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