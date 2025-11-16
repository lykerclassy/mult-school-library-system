// frontend/src/pages/ViewSubmissions.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Download, Check, X } from 'lucide-react';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import { createDownloadFilename } from '../utils/fileUtils'; // <-- 1. IMPORT

// --- (API Functions are unchanged) ---
const fetchSubmissions = async (assignmentId) => {
  const { data } = await apiClient.get(`/assignments/${assignmentId}/submissions`);
  return data;
};
const gradeSubmission = async ({ submissionId, grade, feedback }) => {
  const { data } = await apiClient.put(`/assignments/submissions/${submissionId}/grade`, { grade, feedback });
  return data;
};

// --- (GradeModal component is unchanged) ---
const GradeModal = ({ submission, onClose, onSuccess }) => {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const mutation = useMutation({
    mutationFn: gradeSubmission,
    onSuccess: () => {
      toast.success('Submission graded!');
      onSuccess();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Grading failed'),
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ submissionId: submission._id, grade, feedback });
  };
  return (
    <Modal isOpen={true} onClose={onClose} title={`Grade: ${submission.student.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Grade (e.g., A+, 95%, 10/10)" id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required />
        <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Enter feedback..." className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" rows={4} />
        <Button type="submit" isLoading={mutation.isLoading}>
          Submit Grade
        </Button>
      </form>
    </Modal>
  );
};

// --- Main Page Component (UPDATED) ---
const ViewSubmissions = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => fetchSubmissions(id),
  });

  if (isLoading) return <div>Loading submissions...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">View Submissions</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted On</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions?.map((s) => {
                // --- 2. CREATE THE FILENAME ---
                const filename = createDownloadFilename(
                  `${s.student.name}_${s.student.admissionNumber}`,
                  s.originalFilename
                );

                return (
                  <tr key={s._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(s.submittedOn), 'PPp')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={s.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={filename} // <-- 3. ADD THE DOWNLOAD ATTRIBUTE
                        className="flex items-center text-primary hover:underline"
                      >
                        <Download className="w-4 h-4 mr-1" /> Download
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowVrap">
                      <span className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                        s.status === 'Graded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{s.grade || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button onClick={() => setSelectedSubmission(s)} className="w-auto text-sm py-1">
                        {s.status === 'Graded' ? 'Update Grade' : 'Grade'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSubmission && (
        <GradeModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onSuccess={() => {
            queryClient.invalidateQueries(['submissions', id]);
          }}
        />
      )}
    </div>
  );
};

export default ViewSubmissions;