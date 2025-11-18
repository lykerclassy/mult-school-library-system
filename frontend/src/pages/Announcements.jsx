// frontend/src/pages/Announcements.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Megaphone } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Pagination from '../components/common/Pagination';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../context/AuthContext'; // <-- 1. IMPORT useAuth

// --- API Functions ---
const fetchAnnouncements = async (page) => {
  const { data } = await apiClient.get('/announcements', { params: { page } });
  return data;
};
const fetchGlobalAnnouncements = async () => (await apiClient.get('/comm/global-announcements')).data;
const createAnnouncement = async (data) => (await apiClient.post('/announcements', data)).data;
const deleteAnnouncement = async (id) => (await apiClient.delete(`/announcements/${id}`)).data;
const deleteGlobalAnnouncement = async (id) => (await apiClient.delete(`/comm/global-announcements/${id}`)).data;

// --- Post Form Component (Unchanged) ---
const PostAnnouncementForm = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const mutation = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      toast.success('Announcement posted!');
      queryClient.invalidateQueries(['announcements']);
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
      <h2 className="text-xl font-semibold text-gray-800">Post New Announcement</h2>
      <Input label="Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write announcement..." className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" rows={5} required />
      <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
        <Plus className="w-5 h-5 mr-1" /> Post Announcement
      </Button>
    </form>
  );
};

// --- Main Page Component (UPDATED) ---
const Announcements = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  
  // --- 2. GET USER INFO AND ROLE ---
  const { userInfo } = useAuth();
  const canPost = ['SchoolAdmin', 'Teacher', 'Librarian'].includes(userInfo?.role);
  const isDeveloper = userInfo?.role === 'Developer';
  const isSchoolAdmin = userInfo?.role === 'SchoolAdmin';

  // 3. Fetch School Announcements (for everyone)
  const { data: schoolData, isLoading: isLoadingSchool } = useQuery({
    queryKey: ['announcements', page],
    queryFn: () => fetchAnnouncements(page),
    keepPreviousData: true,
  });
  
  // 4. Fetch Global Announcements (ONLY if user is an Admin)
  const { data: globalData, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['globalAnnouncements'],
    queryFn: fetchGlobalAnnouncements,
    enabled: isSchoolAdmin, // <-- This is the fix
  });

  // 5. Merge them
  const combinedAnnouncements = useMemo(() => {
    const school = schoolData?.docs.map(a => ({ ...a, type: 'school' })) || [];
    // Only add global data if it was fetched
    const global = isSchoolAdmin ? (globalData?.map(a => ({ ...a, type: 'global' })) || []) : [];
    
    const all = page === 1 ? [...global, ...school] : [...school];
    
    return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [schoolData, globalData, page, isSchoolAdmin]);

  // (Delete mutations are unchanged)
  const deleteSchoolMutation = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries(['announcements']);
      setSelected(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });
  const deleteGlobalMutation = useMutation({
    mutationFn: deleteGlobalAnnouncement,
    onSuccess: () => {
      toast.success('Global announcement deleted');
      queryClient.invalidateQueries(['globalAnnouncements']);
      setSelected(null);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });
  const handleDelete = () => {
    if (selected.type === 'global') {
      deleteGlobalMutation.mutate(selected._id);
    } else {
      deleteSchoolMutation.mutate(selected._id);
    }
  };
  
  const isLoading = isLoadingSchool || isLoadingGlobal;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Announcements</h1>
      
      {canPost && <PostAnnouncementForm />}

      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Announcements</h2>
      {isLoading && <p>Loading...</p>}
      <div className="space-y-4">
        {combinedAnnouncements.map((a) => (
          <div key={a._id} className={`p-6 rounded-lg shadow relative ${
            a.type === 'global' ? 'border-2 border-primary' : 'bg-white'
          }`}>
            
            {( (a.type === 'school' && (userInfo.role === 'SchoolAdmin' || a.postedBy._id === userInfo._id)) ||
              (a.type === 'global' && isDeveloper)
            ) && (
              <button
                onClick={() => setSelected(a)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}

            {a.type === 'global' && (
              <div className="flex items-center text-primary font-semibold text-sm mb-1">
                <Megaphone className="w-4 h-4 mr-2" />
                GLOBAL ANNOUNCEMENT
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
            <p className="text-xs text-gray-500 mb-2">
              Posted by {a.postedBy.name} ({a.postedBy.role}) on {format(new Date(a.createdAt), 'PP')}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">{a.content}</p>
          </div>
        ))}
      </div>

      {schoolData && (
        <Pagination data={schoolData} onPageChange={(newPage) => setPage(newPage)} />
      )}

      <ConfirmationModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete this announcement? This cannot be undone.`}
        isLoading={deleteSchoolMutation.isLoading || deleteGlobalMutation.isLoading}
      />
    </div>
  );
};

export default Announcements;