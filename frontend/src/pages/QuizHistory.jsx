// frontend/src/pages/QuizHistory.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { format } from 'date-fns';
import { Book } from 'lucide-react';

// --- API Function ---
const fetchMyAttempts = async () => {
  const { data } = await apiClient.get('/manual-quiz/my-history');
  return data;
};

// --- Main Page Component ---
const QuizHistory = () => {
  const { data: attempts, isLoading } = useQuery({
    queryKey: ['myQuizHistory'],
    queryFn: fetchMyAttempts,
  });

  if (isLoading) return <div>Loading your quiz history...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Quiz History</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quiz Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Taken</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attempts?.map((attempt) => (
                <tr key={attempt._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {attempt.quiz?.title || 'Quiz (Deleted)'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attempt.quiz?.subject?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                    {attempt.score} / {attempt.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(attempt.createdAt), 'PPp')}
                  </td>
                </tr>
              ))}
              {attempts?.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    You have not taken any quizzes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizHistory;