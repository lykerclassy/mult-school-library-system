// frontend/src/pages/Leaderboard.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Trophy } from 'lucide-react';

// --- API Function ---
const fetchLeaderboard = async () => {
  const { data } = await apiClient.get('/manual-quiz/leaderboard');
  return data;
};

// --- Main Page Component ---
const Leaderboard = () => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-yellow-700" />;
    return <span className="font-semibold text-gray-500">{index + 1}</span>;
  };

  if (isLoading) return <div>Loading leaderboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Leaderboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ul className="divide-y divide-gray-200">
          <li className="px-6 py-4 flex items-center justify-between bg-gray-50">
            <span className="text-xs font-medium text-gray-500 uppercase w-12">Rank</span>
            <span className="text-xs font-medium text-gray-500 uppercase flex-1">Student Name</span>
            <span className="text-xs font-medium text-gray-500 uppercase">Total Score</span>
          </li>
          {leaderboard?.map((student, index) => (
            <li key={student.admissionNumber} className="px-6 py-4 flex items-center justify-between">
              <div className="w-12 flex justify-center">{getRankIcon(index)}</div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{student.name}</p>
                <p className="text-sm text-gray-500">Adm: {student.admissionNumber}</p>
              </div>
              <p className="text-lg font-bold text-primary">{student.totalScore}</p>
            </li>
          ))}
          {leaderboard?.length === 0 && (
            <li className="p-4 text-center text-gray-500">No quiz attempts recorded yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Leaderboard;