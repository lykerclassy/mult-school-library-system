// frontend/src/pages/StudentAssignments.jsx

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';

// --- API Function ---
const fetchStudentAssignments = async () => {
  const { data } = await apiClient.get('/assignments/student');
  return data;
};

// --- Assignment Card ---
const AssignmentCard = ({ assignment }) => {
  const isSubmitted = assignment.submissionStatus === 'Submitted' || assignment.submissionStatus === 'Graded';
  
  return (
    <Link
      to={`/student/assignment/${assignment._id}`}
      className="bg-white rounded-lg shadow p-4 flex justify-between items-center transition-transform hover:shadow-md hover:scale-[1.02]"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
          <span>{assignment.subject?.name}</span>
          <span>|</span>
          <span>Due: {format(new Date(assignment.dueDate), 'PP')}</span>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {isSubmitted ? (
          <span className="flex items-center text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">
            <CheckCircle className="w-4 h-4 mr-1" />
            {assignment.submissionStatus}
          </span>
        ) : (
          <span className="flex items-center text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </span>
        )}
        <ChevronRight className="w-6 h-6 text-gray-400" />
      </div>
    </Link>
  );
};


// --- Main Page Component ---
const StudentAssignments = () => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['studentAssignments'],
    queryFn: fetchStudentAssignments,
  });

  if (isLoading) return <div>Loading assignments...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Assignments</h1>
      
      <div className="space-y-4">
        {assignments?.length > 0 ? (
          assignments.map(a => <AssignmentCard key={a._id} assignment={a} />)
        ) : (
          <p className="text-gray-500 text-center">You have no assignments.</p>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;