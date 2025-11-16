// frontend/src/pages/DevSettings.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchConfig = async () => (await apiClient.get('/config')).data;
const updateConfig = async (data) => (await apiClient.put('/config', data)).data;

// --- API Keys Form ---
const ApiKeysForm = ({ configData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (configData) {
      setFormData({
        googleAiKey: configData.googleAiKey || '',
        openAiKey: configData.openAiKey || '',
        cloudinaryCloudName: configData.cloudinaryCloudName || '',
        cloudinaryApiKey: configData.cloudinaryApiKey || '',
        cloudinaryApiSecret: configData.cloudinaryApiSecret || '',
        intasendPubKey: configData.intasendPubKey || '',
        intasendSecretKey: configData.intasendSecretKey || '',
      });
    }
  }, [configData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI Keys */}
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">AI Keys</legend>
        <Input label="Google AI Key" id="googleAiKey" value={formData.googleAiKey} onChange={handleChange} />
        <Input label="OpenAI Key" id="openAiKey" value={formData.openAiKey} onChange={handleChange} />
      </fieldset>
      
      {/* Cloudinary */}
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">Cloudinary</legend>
        <Input label="Cloud Name" id="cloudinaryCloudName" value={formData.cloudinaryCloudName} onChange={handleChange} />
        <Input label="API Key" id="cloudinaryApiKey" value={formData.cloudinaryApiKey} onChange={handleChange} />
        <Input label="API Secret" id="cloudinaryApiSecret" type="password" value={formData.cloudinaryApiSecret} onChange={handleChange} />
      </fieldset>
      
      {/* IntaSend */}
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">IntaSend (Payment)</legend>
        <Input label="Public Key" id="intasendPubKey" value={formData.intasendPubKey} onChange={handleChange} />
        <Input label="Secret Key" id="intasendSecretKey" type="password" value={formData.intasendSecretKey} onChange={handleChange} />
      </fieldset>
      
      <Button type="submit" isLoading={isLoading} className="w-auto">Save API Keys</Button>
    </form>
  );
};

// --- SMTP Form ---
const SmtpForm = ({ configData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (configData) {
      setFormData({
        smtpHost: configData.smtpHost || '',
        smtpPort: configData.smtpPort || '',
        smtpUser: configData.smtpUser || '',
        smtpPass: configData.smtpPass || '',
      });
    }
  }, [configData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="SMTP Host" id="smtpHost" value={formData.smtpHost} onChange={handleChange} placeholder="e.g., smtp.mailgun.org" />
      <Input label="SMTP Port" id="smtpPort" type="number" value={formData.smtpPort} onChange={handleChange} placeholder="e.g., 587" />
      <Input label="SMTP User" id="smtpUser" value={formData.smtpUser} onChange={handleChange} />
      <Input label="SMTP Password" id="smtpPass" type="password" value={formData.smtpPass} onChange={handleChange} />
      <Button type="submit" isLoading={isLoading} className="w-auto">Save SMTP Settings</Button>
    </form>
  );
};


// --- Main Page Component ---
const DevSettings = () => {
  const [activeTab, setActiveTab] = useState('apiKeys');
  const queryClient = useQueryClient();

  const { data: configData, isLoading } = useQuery({
    queryKey: ['globalConfig'],
    queryFn: fetchConfig,
  });

  const mutation = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      toast.success('Settings saved!');
      queryClient.invalidateQueries(['globalConfig']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });
  
  const handleSave = (formData) => {
    mutation.mutate(formData);
  };
  
  const tabs = [
    { id: 'apiKeys', name: 'API Keys' },
    { id: 'smtp', name: 'Email (SMTP)' },
    { id: 'billing', name: 'Usage & Invoicing' },
    { id: 'logs', name: 'System Logs' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">System Settings</h1>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
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

      {/* Tab Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        {isLoading && <p>Loading settings...</p>}
        
        {activeTab === 'apiKeys' && configData && (
          <ApiKeysForm configData={configData} onSave={handleSave} isLoading={mutation.isLoading} />
        )}
        
        {activeTab === 'smtp' && configData && (
          <SmtpForm configData={configData} onSave={handleSave} isLoading={mutation.isLoading} />
        )}

        {activeTab === 'billing' && (
          <p className="text-gray-500">Usage tracking and invoicing features are coming soon.</p>
        )}
        
        {activeTab === 'logs' && (
          <p className="text-gray-500">System maintenance and error logs will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default DevSettings;