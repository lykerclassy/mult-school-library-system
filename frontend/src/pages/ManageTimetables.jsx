// frontend/src/pages/ManageTimetables.jsx

import React, { useState, useMemo } from 'react'; // <-- Import useMemo
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input'; // <-- IMPORT Input

// --- API Functions ---
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchTeachers = async () => {
  // Fetch all staff and filter for teachers
  const { data } = await apiClient.get('/users/staff');
  return data.filter(s => s.role === 'Teacher');
};
const fetchTimetable = async (classId) => (await apiClient.get(`/timetables/class/${classId}`)).data;
const createEntry = async (data) => (await apiClient.post('/timetables', data)).data;
const deleteEntry = async (id) => (await apiClient.delete(`/timetables/${id}`)).data;

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// --- Entry Form ---
const TimetableForm = ({ classLevel, onSuccess }) => {
  const queryClient = useQueryClient(); // <-- FIX: Add queryClient
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:40');
  
  const { data: subjects, isLoading: l1 } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects });
  const { data: teachers, isLoading: l2 } = useQuery({ queryKey: ['teachers'], queryFn: fetchTeachers });

  const mutation = useMutation({
    mutationFn: createEntry,
    onSuccess: () => {
      toast.success('Entry added!');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !teacher) {
      toast.error('Please select a subject and a teacher.');
      return;
    }
    mutation.mutate({ classLevel, subject, teacher, dayOfWeek, startTime, endTime });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded-lg shadow space-y-3">
      <h3 className="text-lg font-medium">Add New Entry</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="w-full p-2 border rounded-md">
          {DAYS_OF_WEEK.map(day => <option key={day} value={day}>{day}</option>)}
        </select>
        {/* Use Input component for consistency */}
        <Input label="Start Time" id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        <Input label="End Time" id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2 border rounded-md">
          <option value="">{l1 ? 'Loading...' : 'Select Subject'}</option>
          {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
        <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className="w-full p-2 border rounded-md">
          <option value="">{l2 ? 'Loading...' : 'Select Teacher'}</option>
          {teachers?.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
        <Plus className="w-4 h-4 mr-1" /> Add Entry
      </Button>
    </form>
  );
};

// --- Timetable Display ---
const TimetableDisplay = ({ classId }) => {
  const queryClient = useQueryClient();
  const { data: entries, isLoading } = useQuery({
    queryKey: ['timetable', classId],
    queryFn: () => fetchTimetable(classId),
    enabled: !!classId, // Only run if a class is selected
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => { // <-- FIX: Was 'onSuccess:Next,'
      toast.success('Entry deleted!');
      queryClient.invalidateQueries(['timetable', classId]);
    },
  });

  // Group entries by day
  const timetable = useMemo(() => { // <-- FIX: Was missing useMemo
    const grouped = {};
    DAYS_OF_WEEK.forEach(day => grouped[day] = []);
    entries?.forEach(entry => {
      if (grouped[entry.dayOfWeek]) {
        grouped[entry.dayOfWeek].push(entry);
      }
    });
    return grouped;
  }, [entries]);

  if (isLoading) return <p>Loading timetable...</p>;

  return (
    <div className="space-y-6 mt-6">
      {DAYS_OF_WEEK.map(day => (
        <div key={day}>
          <h3 className="text-xl font-semibold mb-2 text-primary">{day}</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {timetable[day].length === 0 && <li className="p-4 text-gray-500">No lessons scheduled.</li>}
              {timetable[day].map(entry => (
                <li key={entry._id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-gray-800">{entry.startTime} - {entry.endTime}</span>
                    <span className="ml-4 text-gray-700">{entry.subject.name}</span>
                    <span className="ml-2 text-sm text-gray-500">({entry.teacher.name})</span>
                  </div>
                  <button onClick={() => deleteMutation.mutate(entry._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Page ---
const ManageTimetables = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const { data: classes, isLoading } = useQuery({
    queryKey: ['classLevels'],
    queryFn: fetchClassLevels,
  });
  const queryClient = useQueryClient(); // <-- FIX: Add queryClient

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Timetables</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700">Select a Class to Manage</label>
        <select
          id="classSelect"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full max-w-sm p-2 border rounded-md mt-1"
        >
          <option value="">{isLoading ? 'Loading...' : 'Select a Class'}</option>
          {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {selectedClass && (
        <>
          <TimetableForm classLevel={selectedClass} onSuccess={() => {
            queryClient.invalidateQueries(['timetable', selectedClass]);
          }} />
          <TimetableDisplay classId={selectedClass} />
        </>
      )}
    </div>
  );
};

export default ManageTimetables;