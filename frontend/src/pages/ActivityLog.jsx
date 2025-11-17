// frontend/src/pages/ActivityLog.jsx

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { format } from 'date-fns';
import Pagination from '../components/common/Pagination';

// API Functions
const fetchActivityLogs = async (page) => {
  const { data } = await apiClient.get('/logs/activity', { params: { page, limit: 20 } });
  return data;
};
const fetchDeliveryLogs = async (page) => {
  const { data } = await apiClient.get('/logs/delivery', { params: { page, limit: 20 } });
  return data;
};

// --- Log Table Component ---
const LogTable = ({ data, isLoading, type }) => {
  const tableHeaders = type === 'activity' ? [
    'User', 'School', 'Action', 'Details', 'Date'
  ] : [
    'Type', 'Recipient', 'Status', 'Subject', 'Date'
  ];
  
  const getStatusColor = (status) => {
    if (status === 'SUCCESS') return 'bg-green-100 text-green-800';
    if (status === 'FAILED') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="bg-surface rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableHeaders.map(header => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && <tr><td colSpan="5" className="p-4 text-center">Loading logs...</td></tr>}
            {data?.docs.map((log) => (
              <tr key={log._id}>
                {type === 'activity' ? (
                  // Activity Log View
                  <>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{log.user?.name}</div><div className="text-sm text-gray-500">{log.user?.email}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.school?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{log.action}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{log.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(log.createdAt), 'PPp')}</td>
                  </>
                ) : (
                  // Delivery Log View
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.recipient}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>{log.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{log.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(log.createdAt), 'PPp')}</td>
                  </>
                )}
              </tr>
            ))}
            {data?.docs.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- Main Page Component ---
const ActivityLog = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const [activityPage, setActivityPage] = useState(1);
  const [deliveryPage, setDeliveryPage] = useState(1);
  
  // Fetch Activity Logs
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['activityLog', activityPage],
    queryFn: () => fetchActivityLogs(activityPage),
    keepPreviousData: true,
  });

  // Fetch Delivery Logs
  const { data: deliveryData, isLoading: isLoadingDelivery } = useQuery({
    queryKey: ['deliveryLog', deliveryPage],
    queryFn: () => fetchDeliveryLogs(deliveryPage),
    keepPreviousData: true,
  });

  const tabs = [
    { id: 'activity', name: 'User Activity' },
    { id: 'delivery', name: 'Email & SMS Delivery' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">System Audit & Logs</h1>
      
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
      {activeTab === 'activity' && (
        <>
          <LogTable data={activityData} isLoading={isLoadingActivity} type="activity" />
          {activityData && <Pagination data={activityData} onPageChange={setActivityPage} />}
        </>
      )}

      {activeTab === 'delivery' && (
        <>
          <LogTable data={deliveryData} isLoading={isLoadingDelivery} type="delivery" />
          {deliveryData && <Pagination data={deliveryData} onPageChange={setDeliveryPage} />}
        </>
      )}
    </div>
  );
};

export default ActivityLog;