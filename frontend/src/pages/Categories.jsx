// frontend/src/pages/Categories.jsx

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- Reusable Category Manager Component ---
const CategoryManager = ({ queryKey, apiPath, title }) => {
  const queryClient = useQueryClient();
  const [name, setName] = React.useState('');

  // 1. Fetch data
  const { data: items, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const { data } = await apiClient.get(apiPath);
      return data;
    },
  });

  // 2. Create mutation
  const mutation = useMutation({
    mutationFn: (newName) => apiClient.post(apiPath, { name: newName }),
    onSuccess: () => {
      toast.success(`${title} added successfully!`);
      queryClient.invalidateQueries([queryKey]);
      setName('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add item');
    },
  });

  // 3. Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(name);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      
      {/* Add Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
        <Input
          id={`add-${queryKey}`}
          placeholder={`e.g. "Physics" or "Form 1"`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" isLoading={mutation.isLoading} className="w-auto">
          Add
        </Button>
      </form>

      {/* List */}
      <div className="border rounded-md">
        {isLoading && <p className="p-4 text-gray-500">Loading...</p>}
        <ul className="divide-y divide-gray-200">
          {items?.map((item) => (
            <li key={item._id} className="p-3 text-sm text-gray-700">
              {item.name}
            </li>
          ))}
          {items?.length === 0 && (
            <li className="p-3 text-sm text-gray-500">No items created yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

// --- Main Categories Page Component ---
const Categories = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Manage Categories
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CategoryManager
          queryKey="subjects"
          apiPath="/subjects"
          title="Manage Subjects"
        />
        <CategoryManager
          queryKey="classLevels"
          apiPath="/classes"
          title="Manage Class Levels"
        />
      </div>
    </div>
  );
};

export default Categories;