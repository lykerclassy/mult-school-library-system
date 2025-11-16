// frontend/src/pages/GlobalAnnouncements.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

// --- API Functions ---
const fetchGlobalAnnouncements = async () => (await apiClient.get('/comm/global-announcements')).data;
const createGlobalAnnouncement = async (data) => (await apiClient.post('/comm/global-announcements', data)).data;

// --- Post Form (for Developer) ---
const PostForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const mutation = useMutation({
    mutationFn: createGlobalAnnouncement,
    onSuccess: () => {
      toast.success('Announcement posted to all schools!');
      queryClient.invalidateQueries(['globalAnnouncements']);
      setTitle('');
      setContent('');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ title, content });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4 mb-8">
      <h2 className="text-xl font-semibold text-gray-800">Post Global Announcement</h2>
      <Input label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea
        id="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your message here... This will be sent to ALL schools."
        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        rows={5}
        required
      />
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
        Post to All
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const GlobalAnnouncements = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['globalAnnouncements'],
    queryFn: fetchGlobalAnnouncements,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Global Announcements</h1>
      <PostForm />
      {/* We can add a list of past announcements here later */}
    </div>
  );
};

export default GlobalAnnouncements;