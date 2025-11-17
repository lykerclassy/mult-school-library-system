// frontend/src/pages/DevSettings.jsx

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ActivityLog from './ActivityLog'; // <-- Import the final log component
import { Loader2 } from 'lucide-react';

// --- API Functions ---
const fetchConfig = async () => (await apiClient.get('/config')).data;
const updateConfig = async (data) => (await apiClient.put('/config', data)).data;
const testSms = async (phoneNumber) => (await apiClient.post('/config/test-sms', { testPhoneNumber: phoneNumber })).data;
const fetchDevAnalytics = async () => (await apiClient.get('/analytics/developer')).data; 


// --- API Keys Form (unchanged) ---
const ApiKeysForm = ({ configData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (configData) {
      setFormData({
        googleAiKey: configData.googleAiKey || '', openAiKey: configData.openAiKey || '',
        cloudinaryCloudName: configData.cloudinaryCloudName || '', cloudinaryApiKey: configData.cloudinaryApiKey || '', cloudinaryApiSecret: configData.cloudinaryApiSecret || '',
        intasendPubKey: configData.intasendPubKey || '', intasendSecretKey: configData.intasendSecretKey || '',
        smsUsername: configData.smsUsername || '', smsApiKey: configData.smsApiKey || '', smsSenderId: configData.smsSenderId || '',
      });
    }
  }, [configData]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">AI Keys</legend>
        <Input label="Google AI Key" id="googleAiKey" value={formData.googleAiKey} onChange={handleChange} />
        <Input label="OpenAI Key" id="openAiKey" value={formData.openAiKey} onChange={handleChange} />
      </fieldset>
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">Cloudinary</legend>
        <Input label="Cloud Name" id="cloudinaryCloudName" value={formData.cloudinaryCloudName} onChange={handleChange} />
        <Input label="API Key" id="cloudinaryApiKey" value={formData.cloudinaryApiKey} onChange={handleChange} />
        <Input label="API Secret" id="cloudinaryApiSecret" type="password" value={formData.cloudinaryApiSecret} onChange={handleChange} />
      </fieldset>
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">IntaSend (Payment)</legend>
        <Input label="Public Key" id="intasendPubKey" value={formData.intasendPubKey} onChange={handleChange} />
        <Input label="Secret Key" id="intasendSecretKey" type="password" value={formData.intasendSecretKey} onChange={handleChange} />
      </fieldset>
      <fieldset className="p-4 border rounded-md">
        <legend className="font-semibold">SMS Gateway (Africa's Talking)</legend>
        <Input label="SMS Username" id="smsUsername" value={formData.smsUsername} onChange={handleChange} />
        <Input label="SMS API Key" id="smsApiKey" type="password" value={formData.smsApiKey} onChange={handleChange} />
        <Input label="Sender ID / Shortcode" id="smsSenderId" value={formData.smsSenderId} onChange={handleChange} placeholder="e.g., MySaaS or 20123" />
      </fieldset>
      <Button type="submit" isLoading={isLoading} className="w-auto">Save API Keys</Button>
    </form>
  );
};

// --- (SmtpForm is unchanged) ---
const SmtpForm = ({ configData, onSave, isLoading }) => {
  const [formData, setFormData] = useState({ smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '' });
  useEffect(() => {
    if (configData) {
      setFormData({ smtpHost: configData.smtpHost || '', smtpPort: configData.smtpPort || '', smtpUser: configData.smtpUser || '', smtpPass: configData.smtpPass || '', });
    }
  }, [configData]);
  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };
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

// --- (SmsTestForm is unchanged) ---
const SmsTestForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const mutation = useMutation({ mutationFn: testSms, onSuccess: (data) => { toast.success(data.message || 'Test SMS sent!'); }, onError: (error) => { toast.error(error.response?.data?.message || 'Failed'); } });
  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(phoneNumber); };
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold">Test Your SMS Setup</h3>
      <p className="text-sm text-gray-500 mb-2">Enter your phone number (e.g., +254712345678) to receive a test message.</p>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input id="test-sms" type="tel" placeholder="e.g., +254712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="flex-1" />
        <Button type="submit" isLoading={mutation.isLoading} className="w-auto">Send Test</Button>
      </form>
    </div>
  );
};


// --- Billing Usage Report Component (NEW) ---
const BillingUsageReport = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['devAnalytics'],
    queryFn: fetchDevAnalytics,
  });

  if (isLoading) return <div className="flex items-center space-x-2"><Loader2 className="w-5 h-5 animate-spin" /> <p>Loading usage stats...</p></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold border-b pb-2 text-primary">Global Usage Report (SaaS Metrics)</h3>
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><strong>Total Schools:</strong> {stats.totalSchools}</p>
        <p><strong>Total Users:</strong> {stats.totalUsers}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><strong>Total Monthly Revenue:</strong> <span className="font-bold">KES {stats.totalRevenue.toFixed(2)}</span></p>
        <p><strong>Total Active Subscriptions:</strong> <span className="text-green-600 font-bold">{stats.totalSchools}</span></p>
      </div>
      <p className="text-sm text-gray-500 pt-2 border-t mt-4">
        *Usage tracking and automated invoicing features are coming soon.
      </p>
    </div>
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
      toast.success('Settings saved! Please restart the server for changes to take effect.');
      queryClient.invalidateQueries(['globalConfig']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed'),
  });
  
  const handleSave = (formData) => {
    const updatedData = { ...configData, ...formData };
    mutation.mutate(updatedData);
  };
  
  const tabs = [
    { id: 'apiKeys', name: 'API Keys & SMS' },
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

      <div className="bg-white p-6 rounded-lg shadow">
        {isLoading && <p>Loading settings...</p>}
        
        {/* --- API KEYS TAB --- */}
        {activeTab === 'apiKeys' && configData && (
          <>
            <ApiKeysForm configData={configData} onSave={handleSave} isLoading={mutation.isLoading} />
            <hr className="my-6" />
            <SmsTestForm />
          </>
        )}
        
        {/* --- SMTP TAB --- */}
        {activeTab === 'smtp' && configData && (
          <SmtpForm configData={configData} onSave={handleSave} isLoading={mutation.isLoading} />
        )}

        {/* --- BILLING/USAGE TAB --- */}
        {activeTab === 'billing' && configData && (
          <BillingUsageReport />
        )}
        
        {/* --- SYSTEM LOGS TAB --- */}
        {activeTab === 'logs' && configData && (
          <ActivityLog /> // Renders the full ActivityLog component
        )}
      </div>
    </div>
  );
};

export default DevSettings;