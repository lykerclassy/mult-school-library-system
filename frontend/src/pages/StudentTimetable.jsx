// frontend/src/pages/StudentTimetable.jsx

import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';

// --- API Function ---
const fetchMyTimetable = async () => (await apiClient.get('/timetables/my-timetable')).data;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const StudentTimetable = () => {
  const { userInfo } = useAuth();
  const { data: entries, isLoading } = useQuery({
    queryKey: ['myTimetable'],
    queryFn: fetchMyTimetable,
  });

  // Group entries by day
  const timetable = useMemo(() => {
    const grouped = {};
    DAYS_OF_WEEK.forEach(day => grouped[day] = []);
    entries?.forEach(entry => {
      if (grouped[entry.dayOfWeek]) {
        grouped[entry.dayOfWeek].push(entry);
      }
    });
    return grouped;
  }, [entries]);

  if (isLoading) return <div>Loading your timetable...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Timetable</h1>
      
      <div className="space-y-6">
        {DAYS_OF_WEEK.map(day => (
          <div key={day}>
            <h3 className="text-xl font-semibold mb-2 text-primary">{day}</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {timetable[day].length === 0 && <li className="p-4 text-gray-500">No lessons scheduled.</li>}
                {timetable[day].map(entry => (
                  <li key={entry._id} className="p-4">
                    <span className="font-bold text-gray-800">{entry.startTime} - {entry.endTime}</span>
                    <span className="ml-4 text-gray-700">{entry.subject.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({entry.teacher.name})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentTimetable;