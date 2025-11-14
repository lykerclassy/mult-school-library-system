// frontend/src/pages/Settings.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

// --- API Functions ---
const fetchSchoolProfile = async () => {
  const { data } = await apiClient.get('/schools/profile');
  return data;
};
const updateSchoolProfile = async (formData) => {
  const { data } = await apiClient.put('/schools/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
// --- NEW API FUNCTION ---
const updateUserProfile = async (profileData) => {
  const { data } = await apiClient.put('/users/profile', profileData);
  return data;
};

// --- Components ---

// --- (SchoolProfileSettings component is unchanged) ---
const SchoolProfileSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', address: '', motto: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState('');
  const { data: school, isLoading } = useQuery({ queryKey: ['schoolProfile'], queryFn: fetchSchoolProfile });
  useEffect(() => {
    if (school) {
      setFormData({ name: school.name || '', address: school.address || '', motto: school.motto || '' });
      setPreview(school.logo || '');
    }
  }, [school]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const mutation = useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: (data) => {
      toast.success('School profile updated!');
      queryClient.invalidateQueries(['schoolProfile']);
      setPreview(data.logo);
      setLogoFile(null);
    },
    onError: (error) => { toast.error(error.response?.data?.message || 'Update failed') },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('address', formData.address);
    submitData.append('motto', formData.motto);
    if (logoFile) {
      submitData.append('logo', logoFile);
    }
    mutation.mutate(submitData);
  };
  if (isLoading) return <div>Loading settings...</div>;
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        {preview ? (
          <img src={preview} alt="School Logo" className="w-24 h-24 rounded-full object-cover bg-gray-200" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">No Logo</div>
        )}
        <div>
          <label htmlFor="logo" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Change Logo</label>
          <input id="logo" name="logo" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB.</p>
        </div>
      </div>
      <Input label="School Name" id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <Input label="School Address" id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      <Input label="School Motto" id="motto" value={formData.motto} onChange={(e) => setFormData({ ...formData, motto: e.target.value })} />
      <div className="pt-2 max-w-xs">
        <Button type="submit" isLoading={mutation.isLoading}>Save Changes</Button>
      </div>
    </form>
  );
};


// --- MyProfileSettings Component (UPDATED) ---
const MyProfileSettings = () => {
  const { userInfo, login } = useAuth(); // Get login to update context
  const queryClient = useQueryClient();
  const [name, setName] = useState(userInfo.name);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      // Update the user info in our global state
      login(data);
      // Clear password fields
      setPassword('');
      setConfirmPassword('');
      // Invalidate authUser query to be safe
      queryClient.invalidateQueries(['authUser']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // Only send fields that are being updated
    const profileData = { name, email };
    if (password) {
      profileData.password = password;
    }
    
    mutation.mutate(profileData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <Input
        label="Full Name"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Email Address"
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <hr />
      <p className="text-sm text-gray-600">
        Leave password fields blank to keep your current password.
      </p>
      <Input
        label="New Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm New Password"
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <div className="pt-2 max-w-xs">
        <Button type="submit" isLoading={mutation.isLoading}>
          Update Profile
        </Button>
      </div>
    </form>
  );
};

// --- (Main Settings Component is unchanged) ---
const Settings = () => {
  const [activeTab, setActiveTab] = useState('myProfile');
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'SchoolAdmin';
  
  const tabs = [{ id: 'myProfile', name: 'My Profile' }];
  if (isAdmin) {
    tabs.push({ id: 'schoolProfile', name: 'School Profile' });
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      <div className="py-6">
        {activeTab === 'myProfile' && <MyProfileSettings />}
        {activeTab === 'schoolProfile' && isAdmin && <SchoolProfileSettings />}
      </div>
    </div>
  );
};

export default Settings;