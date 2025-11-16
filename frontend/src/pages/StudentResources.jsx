// frontend/src/pages/StudentResources.jsx

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { Download, Search, FileText } from 'lucide-react';
import { createDownloadFilename } from '../utils/fileUtils'; // <-- 1. IMPORT

// --- (API Functions are unchanged) ---
const fetchStudentResources = async () => (await apiClient.get('/resources/student')).data;
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;

// --- Resource Card Component (UPDATED) ---
const ResourceCard = ({ resource }) => {
  // --- 2. CREATE THE FILENAME ---
  const filename = createDownloadFilename(resource.title, resource.originalFilename);

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
            {resource.resourceType}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{resource.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs mb-4">
          {resource.subject && (
            <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{resource.subject.name}</span>
          )}
          {resource.classLevel && (
            <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{resource.classLevel.name}</span>
          )}
        </div>
      </div>
      <a
        href={resource.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={filename} // <-- 3. ADD THE DOWNLOAD ATTRIBUTE
        className="w-full mt-2 flex items-center justify-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700"
      >
        <Download className="w-5 h-5" />
        <span>Download</span>
      </a>
    </div>
  );
};

// --- (Main Page Component is unchanged) ---
const StudentResources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [resourceType, setResourceType] = useState('');

  const { data: resources, isLoading } = useQuery({ queryKey: ['studentResources'], queryFn: fetchStudentResources });
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects });
  const { data: classes } = useQuery({ queryKey: ['classLevels'], queryFn: fetchClassLevels });
  const resourceTypes = ['E-book', 'Past Paper', 'Notes', 'Syllabus'];

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    return resources.filter(res => {
      const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !subject || res.subject?._id === subject;
      const matchesClass = !classLevel || res.classLevel?._id === classLevel;
      const matchesType = !resourceType || res.resourceType === resourceType;
      return matchesSearch && matchesSubject && matchesClass && matchesType;
    });
  }, [resources, searchTerm, subject, classLevel, resourceType]);

  if (isLoading) return <div>Loading resources...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Learning Resources</h1>
      <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
        <div className="relative w-full">
          <input type="text" placeholder="Search resources by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-md" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select onChange={(e) => setResourceType(e.target.value)} value={resourceType} className="w-full p-2 border rounded-md">
            <option value="">All Types</option>
            {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length > 0 ? (
          filteredResources.map(res => <ResourceCard key={res._id} resource={res} />)
        ) : (
          <p className="text-gray-500 md:col-span-3 text-center">No resources found matching your criteria.</p>
        )}
      </div>
    </div>
  );
};

export default StudentResources;