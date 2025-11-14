// frontend/src/pages/ManualQuizList.jsx

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Link } from 'react-router-dom';
import { Search, FileText, ChevronRight } from 'lucide-react';

// --- API Functions ---
const fetchStudentQuizzes = async () => (await apiClient.get('/manual-quiz/student')).data;
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;

// --- Quiz Card Component ---
const QuizCard = ({ quiz }) => {
  return (
    <Link
      to={`/manual-quiz/${quiz._id}`}
      className="bg-white rounded-lg shadow p-4 flex justify-between items-center transition-transform hover:shadow-md hover:scale-[1.02]"
    >
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {quiz.subject && (
            <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{quiz.subject.name}</span>
          )}
          {quiz.classLevel && (
            <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{quiz.classLevel.name}</span>
          )}
        </div>
      </div>
      <ChevronRight className="w-6 h-6 text-gray-400" />
    </Link>
  );
};

// --- Main Page Component ---
const ManualQuizList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');

  // Fetch all data
  const { data: quizzes, isLoading } = useQuery({ queryKey: ['studentQuizzes'], queryFn: fetchStudentQuizzes });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects });
  const { data: classes } = useQuery({ queryKey: ['classLevels'], queryFn: fetchClassLevels });
  
  // Filter logic
  const filteredQuizzes = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !subject || quiz.subject?._id === subject;
      const matchesClass = !classLevel || quiz.classLevel?._id === classLevel;
      return matchesSearch && matchesSubject && matchesClass;
    });
  }, [quizzes, searchTerm, subject, classLevel]);

  if (isLoading) return <div>Loading quizzes...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Available Quizzes</h1>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search quizzes by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select onChange={(e) => setSubject(e.target.value)} value={subject} className="w-full p-2 border rounded-md">
            <option value="">All Subjects</option>
            {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select onChange={(e) => setClassLevel(e.target.value)} value={classLevel} className="w-full p-2 border rounded-md">
            <option value="">All Classes</option>
            {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map(quiz => <QuizCard key={quiz._id} quiz={quiz} />)
        ) : (
          <p className="text-gray-500 text-center">No quizzes found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default ManualQuizList;