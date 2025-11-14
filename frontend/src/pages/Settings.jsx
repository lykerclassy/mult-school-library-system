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
    headers: {
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  });
  return data;
};

// --- Components ---

const SchoolProfileSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    motto: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview] = useState('');

  // 1. Fetch existing data
  const { data: school, isLoading } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: fetchSchoolProfile,
  });

  // 2. Populate form once data is loaded
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name || '',
        address: school.address || '',
        motto: school.motto || '',
      });
      setPreview(school.logo || '');
    }
  }, [school]);

  // 3. Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreview(URL.createObjectURL(file)); // Show local preview
    }
  };

  // 4. Setup mutation for update
  const mutation = useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: (data) => {
      toast.success('School profile updated!');
      queryClient.invalidateQueries(['schoolProfile']);
      setPreview(data.logo); // Update preview with new Cloudinary URL
      setLogoFile(null);
    },
    onError: (error) => {
      console.error('Mutation Error:', error); // <-- Added for debugging
      toast.error(error.response?.data?.message || 'Update failed');
    },
  });

  // 5. Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // --- DEBUGGING LINE ---
    // Check your browser console for this message when you click "Save"
    console.log('handleSubmit function fired!'); 
    // ----------------------

    // We must use FormData to send files
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('address', formData.address);
    submitData.append('motto', formData.motto);
    if (logoFile) {
      submitData.append('logo', logoFile);
    }
    
    console.log('Mutating with data:', ...submitData.entries()); // <-- More debugging
    mutation.mutate(submitData);
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <div className="flex items-center space-x-6">
        
        {/* --- THIS IS THE FIX ---
            We only render the <img> tag if there is a 'preview' URL.
            This stops the "placeholder.com" error completely.
        */}
        {preview ? (
          <img
            src={preview}
            alt="School Logo"
            className="w-24 h-24 rounded-full object-cover bg-gray-200"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            No Logo
          </div>
        )}

        <div>
          <label
            htmlFor="logo"
            className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Change Logo
          </label>
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="sr-only"
          />
          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB.</p>
        </div>
      </div>

      {/* Text Fields */}
      <Input
        label="School Name"
        id="name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <Input
        label="School Address"
        id="address"
        value={formData.address}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />
      <Input
        label="School Motto"
        id="motto"
        value={formData.motto}
        onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
      />

      <div className="pt-2 max-w-xs">
        <Button type="submit" isLoading={mutation.isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// --- (The rest of the file is unchanged) ---

const MyProfileSettings = () => {
  const { userInfo } = useAuth();
  return (
    <div>
      <h3 className="text-lg font-semibold">Update Your Profile</h3>
      <p>Name: {userInfo?.name}</p>
      <p>Email: {userInfo?.email}</p>
      <p className="mt-4 text-gray-500">(Profile update form coming soon...)</p>
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('myProfile');
  const { userInfo } = useAuth();
  const isAdmin = userInfo?.role === 'SchoolAdmin';
  
  const tabs = [
    { id: 'myProfile', name: 'My Profile' },
  ];

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