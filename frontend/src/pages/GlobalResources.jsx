// frontend/src/pages/GlobalResources.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

// --- API Functions ---
const fetchGlobalResources = async () => (await apiClient.get('/resources/global')).data;
const createGlobalResource = async (formData) => (await apiClient.post('/resources/global', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})).data;
const deleteResource = async (id) => (await apiClient.delete(`/resources/${id}`)).data; // Same delete endpoint

// --- Upload Form Component ---
const UploadResourceForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  
  const mutation = useMutation({
    mutationFn: createGlobalResource,
    onSuccess: () => {
      toast.success('Global resource uploaded!');
      queryClient.invalidateQueries(['globalResources']);
      setTitle('');
      setFile(null);
      document.getElementById('file-input').value = null;
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Upload failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select a file'); return; }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('resourceType', 'Global'); // Set type
    
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Upload Global Resource</h2>
      <Input label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <div>
        <label className="block text-sm font-medium text-gray-700">File</label>
        <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-input" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700">
                <span>Upload a file</span>
                <input id="file-input" name="file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
              </label>
              <p className="pl-1">{file ? file.name : 'or drag and drop'}</p>
            </div>
            <p className="text-xs text-gray-500">PDF, DOCX, PPTX, etc.</p>
          </div>
        </div>
      </div>
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">Upload</Button>
    </form>
  );
};

// --- Resource Table Component ---
const ResourceTable = () => {
  const queryClient = useQueryClient();
  const { data: resources, isLoading } = useQuery({
    queryKey: ['globalResources'],
    queryFn: fetchGlobalResources,
  });

  const mutation = useMutation({
    mutationFn: deleteResource,
    onSuccess: () => {
      toast.success('Resource deleted');
      queryClient.invalidateQueries(['globalResources']);
    },
    onError: (error) => toast.error('Failed to delete resource'),
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
      <h2 className="text-xl font-semibold text-gray-800 p-6">Global Resources</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>}
            {resources?.map((res) => (
              <tr key={res._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{res.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{res.fileType}</td>
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
const GlobalResources = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Global Content</h1>
      <UploadResourceForm />
      <ResourceTable />
    </div>
  );
};

export default GlobalResources;