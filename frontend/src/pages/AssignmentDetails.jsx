// frontend/src/pages/AssignmentDetails.jsx

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Upload, CheckCircle, Download } from 'lucide-react';
import Button from '../components/common/Button';
import { createDownloadFilename } from '../utils/fileUtils'; // <-- 1. IMPORT

// --- (API Functions are unchanged) ---
const fetchAssignment = async (id) => {
  const { data } = await apiClient.get(`/assignments/student/${id}`);
  return data;
};
const submitAssignment = async ({ id, formData }) => {
  const { data } = await apiClient.post(`/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// --- Main Page Component (UPDATED) ---
const AssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['assignment', id],
    queryFn: () => fetchAssignment(id),
  });

  const mutation = useMutation({
    mutationFn: submitAssignment,
    onSuccess: (data) => {
      toast.success('Assignment submitted successfully!');
      refetch();
      setFile(null);
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = null;
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Submission failed');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    mutation.mutate({ id, formData });
  };
  
  if (isLoading) return <div>Loading assignment...</div>;

  const { assignment, submission } = data;
  const isGraded = submission?.status === 'Graded';

  // --- 2. CREATE THE FILENAME ---
  const downloadName = submission
    ? createDownloadFilename(assignment.title, submission.originalFilename)
    : '';

  return (
    <div>
      {/* ... (Header and Instructions are unchanged) ... */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{assignment.title}</h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 mt-2">
          <span><strong>Teacher:</strong> {assignment.teacher?.name}</span>
          <span><strong>Subject:</strong> {assignment.subject?.name}</span>
          <span><strong>Class:</strong> {assignment.classLevel?.name}</span>
          <span className="font-medium text-red-600">
            <strong>Due Date:</strong> {format(new Date(assignment.dueDate), 'PPP')}
          </span>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Instructions</h2>
        <p className="text-gray-600 whitespace-pre-wrap">{assignment.instructions}</p>
      </div>

      {/* Submission Box (UPDATED) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          {isGraded ? 'Your Graded Submission' : 'Your Submission'}
        </h2>
        
        {submission && (
          <div className={`p-4 rounded-lg border mb-4 ${
            isGraded ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{isGraded ? 'Graded' : 'Submitted'}</h4>
                <p className="text-sm text-gray-600">
                  Submitted on: {format(new Date(submission.submittedOn), 'PPp')}
                </p>
                {isGraded && (
                  <p className="text-lg font-bold text-primary mt-2">Grade: {submission.grade}</p>
                )}
              </div>
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={downloadName} // <-- 3. ADD THE DOWNLOAD ATTRIBUTE
                className="flex items-center space-x-2 py-2 px-4 text-primary bg-white border border-primary rounded-md shadow-sm hover:bg-gray-50"
              >
                <Download className="w-5 h-5" />
                <span>View Submission</span>
              </a>
            </div>
            {isGraded && submission.feedback && (
              <div className="mt-4 pt-4 border-t">
                <h5 className="font-semibold">Teacher's Feedback:</h5>
                <p className="text-gray-600 italic mt-1">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {!isGraded && (
          // ... (The form is unchanged) ...
          <form onSubmit={handleSubmit}>
            <p className="text-sm text-gray-600 mb-2">
              {submission ? 'Want to resubmit? Your new file will replace the old one.' : 'Upload your completed work here.'}
            </p>
            <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-input" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-700">
                    <span>Upload your file</span>
                    <input id="file-input" name="file" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : 'PDF, DOCX, TXT, etc.'}</p>
              </div>
            </div>
            <Button type="submit" isLoading={mutation.isLoading} className="mt-4">
              {submission ? 'Resubmit Assignment' : 'Submit Assignment'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetails;