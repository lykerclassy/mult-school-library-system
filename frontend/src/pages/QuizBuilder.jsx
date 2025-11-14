// frontend/src/pages/QuizBuilder.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchSubjects = async () => (await apiClient.get('/subjects')).data;
const fetchClassLevels = async () => (await apiClient.get('/classes')).data;

// --- Question Form Component ---
const QuestionForm = ({ question, index, updateQuestion, removeQuestion }) => {
  const [text, setText] = useState(question.questionText);
  
  const handleOptionChange = (optIndex, field, value) => {
    const newOptions = [...question.options];
    if (field === 'isCorrect') {
      // Uncheck all others
      newOptions.forEach((opt, i) => opt.isCorrect = (i === optIndex));
    } else {
      newOptions[optIndex][field] = value;
    }
    updateQuestion(index, { ...question, options: newOptions });
  };

  const addOption = () => {
    updateQuestion(index, {
      ...question,
      options: [...question.options, { text: '', isCorrect: false }],
    });
  };

  const removeOption = (optIndex) => {
    const newOptions = question.options.filter((_, i) => i !== optIndex);
    updateQuestion(index, { ...question, options: newOptions });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">Question {index + 1}</label>
        <button type="button" onClick={() => removeQuestion(index)} className="text-red-500 hover:text-red-700">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          updateQuestion(index, { ...question, questionText: e.target.value });
        }}
        placeholder="Enter the question text"
        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md"
        rows={2}
      />
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-500">Options (Select the correct answer)</label>
        {question.options.map((opt, optIndex) => (
          <div key={optIndex} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`correct-answer-${index}`}
              checked={opt.isCorrect}
              onChange={() => handleOptionChange(optIndex, 'isCorrect', true)}
            />
            <Input
              id={`q${index}-opt${optIndex}`}
              value={opt.text}
              onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
              placeholder={`Option ${optIndex + 1}`}
              className="flex-1"
            />
            {question.options.length > 2 && ( // Only allow removal if more than 2 options
              <button type="button" onClick={() => removeOption(optIndex)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      <Button type="button" onClick={addOption} className="w-auto text-sm py-1">
        Add Option
      </Button>
    </div>
  );
};

// --- Main Quiz Builder Page ---
const QuizBuilder = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [questions, setQuestions] = useState([]);

  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: fetchSubjects });
  const { data: classes } = useQuery({ queryKey: ['classLevels'], queryFn: fetchClassLevels });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      // Start with 2 options by default
      { questionText: '', options: [{ text: '', isCorrect: false }, { text: '', isCorrect: false }] },
    ]);
  };

  const updateQuestion = (index, updatedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };
  
  const mutation = useMutation({
    mutationFn: (quizData) => apiClient.post('/manual-quiz', quizData),
    onSuccess: () => {
      toast.success('Quiz created successfully!');
      // Reset form
      setTitle('');
      setSubject('');
      setClassLevel('');
      setQuestions([]);
      queryClient.invalidateQueries(['staffQuizzes']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // --- START VALIDATION FIX ---
    if (questions.length === 0) {
      toast.error('Please add at least one question.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Please enter text for Question ${i + 1}.`);
        return;
      }
      
      let oneCorrect = false;
      if (q.options.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options.`);
        return;
      }

      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (!opt.text.trim()) {
          toast.error(`Please enter text for Option ${j + 1} in Question ${i + 1}.`);
          return;
        }
        if (opt.isCorrect) {
          oneCorrect = true;
        }
      }
      
      if (!oneCorrect) {
        toast.error(`Please select a correct answer for Question ${i + 1}.`);
        return;
      }
    }
    // --- END VALIDATION FIX ---

    mutation.mutate({ title, subject, classLevel, questions });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quiz Builder</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Quiz Details</h2>
          <Input
            label="Quiz Title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select onChange={(e) => setSubject(e.target.value)} value={subject} className="w-full p-2 border rounded-md">
              <option value="">Select Subject (Optional)</option>
              {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
            <select onChange={(e) => setClassLevel(e.target.value)} value={classLevel} className="w-full p-2 border rounded-md">
              <option value="">Select Class (Optional)</option>
              {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
          {questions.map((q, index) => (
            <QuestionForm
              key={index}
              index={index}
              question={q}
              updateQuestion={updateQuestion}
              removeQuestion={removeQuestion}
            />
          ))}
          <Button type="button" onClick={addQuestion} className="w-auto">
            <Plus className="w-5 h-5 mr-1" /> Add Question
          </Button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
            <Save className="w-5 h-5 mr-1" /> Save Quiz
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizBuilder;