// frontend/src/pages/ParentDashboard.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Book, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

// --- API Function ---
const fetchParentData = async () => {
  const { data } = await apiClient.get('/assignments/parent');
  return data;
};

const ParentDashboard = () => {
  const { userInfo } = useAuth();
  const { data: childrenData, isLoading } = useQuery({
    queryKey: ['parentDashboard'],
    queryFn: fetchParentData,
  });

  if (isLoading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome, {userInfo?.name}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        This is your parent dashboard.
      </p>

      {childrenData.length === 0 && (
        <p>Your account is not yet linked to any students.</p>
      )}

      {childrenData.map(child => (
        <div key={child.childId} className="bg-white rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 p-6 border-b">
            {child.childName}'s Dashboard
          </h2>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-3">Recent Assignments</h3>
            <ul className="space-y-3">
              {child.assignments.map(a => (
                <li key={a._id} className="p-3 border rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{a.title}</p>
                    <p className="text-sm text-gray-500">{a.subject.name} | Due: {format(new Date(a.dueDate), 'PP')}</p>
                  </div>
                  {a.grade ? (
                    <span className="text-lg font-bold text-primary">{a.grade}</span>
                  ) : (
                    <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.submissionStatus === 'Submitted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {a.submissionStatus === 'Submitted' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Clock className="w-4 h-4 mr-1" />}
                      {a.submissionStatus}
                    </span>
                  )}
                </li>
              ))}
              {child.assignments.length === 0 && <p className="text-gray-500">No assignments found for this child.</p>}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParentDashboard;