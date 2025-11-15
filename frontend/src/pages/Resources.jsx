// frontend/src/pages/Resources.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // <-- IMPORT useQuery
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// --- API Functions ---
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;
const fetchResources = async () => (await apiClient.get('/resources')).data;

// --- Upload Form Component (FIXED) ---
const UploadResourceForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [resourceType, setResourceType] = useState('E-book');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');

  // --- THIS IS THE FIX ---
  // We must fetch the categories here so the dropdowns have data
  const { data: subjects } = useQuery({ 
    queryKey: ['subjects'], 
    queryFn: fetchSubjects 
  });
  const { data: classes } = useQuery({ 
    queryKey: ['classLevels'], 
    queryFn: fetchClassLevels 
  });
  // --- END OF FIX ---

  const mutation = useMutation({
    mutationFn: (formData) => apiClient.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
    onSuccess: () => {
      toast.success('Resource uploaded successfully!');
      queryClient.invalidateQueries(['resources']);
      // Reset form
      setTitle('');
      setFile(null);
      setResourceType('E-book');
      setSubject('');
      setClassLevel('');
      if(document.getElementById('file-input')) {
        document.getElementById('file-input').value = null; // Clear file input
      }
    },
    onError: (error) => {
      // Use the new, clearer error message from our controller
      toast.error(error.response?.data?.message || 'Upload failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('resourceType', resourceType);
    if (subject) formData.append('subject', subject);
    if (classLevel) formData.append('classLevel', classLevel);
    
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Upload New Resource</h2>
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">File</label>
        <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-input"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700"
              >
                <span>Upload a file</span>
                <input id="file-input" name="file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <p className="pl-1">{file ? file.name : 'or drag and drop'}</p>
            </div>
            <p className="text-xs text-gray-500">PDF, DOCX, PPTX, EPUB, TXT up to 50MB</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700">Resource Type</label>
          <select
            id="resourceType"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          >
            <option>E-book</option>
            <option>Past Paper</option>
            <option>Notes</option>
            <option>Syllabus</option>
          </select>
        </div>
        
        {/* This select will now be populated */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject (Optional)</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select Subject</option>
            {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>

        {/* This select will now be populated */}
        <div>
          <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700">Class (Optional)</label>
          <select
            id="classLevel"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select Class</option>
            {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>
      
      <Button type="submit" isLoading={mutation.isLoading}>Upload</Button>
    </form>
  );
};

// --- Resource Table Component (Unchanged) ---
const ResourceTable = () => {
  const queryClient = useQueryClient();
  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: fetchResources,
  });

  const mutation = useMutation({
    mutationFn: (id) => apiClient.delete(`/resources/${id}`),
    onSuccess: () => {
      toast.success('Resource deleted');
      queryClient.invalidateQueries(['resources']);
    },
    onError: (error) => {
      toast.error('Failed to delete resource');
    },
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
      <h2 className="text-xl font-semibold text-gray-800 p-6">Uploaded Resources</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>}
            {resources?.map((res) => (
              <tr key={res._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{res.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.resourceType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.subject?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.classLevel?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(res.createdAt), 'PP')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => mutation.mutate(res._id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Main Page ---
const Resources = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Content Management</h1>
      <UploadResourceForm />
      <ResourceTable />
    </div>
  );
};

export default Resources;