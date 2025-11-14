// frontend/src/pages/Books.jsx

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2, Download } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal'; // <-- IMPORT

// --- API Functions ---
const fetchBooks = async (page, search) => {
  const { data } = await apiClient.get('/books', {
    params: { page, search, limit: 10 },
  });
  return data;
};

const createBook = async (bookData) => {
  const { data } = await apiClient.post('/books', bookData);
  return data;
};
const updateBook = async ({ id, ...bookData }) => {
  const { data } = await apiClient.put(`/books/${id}`, bookData);
  return data;
};

// --- NEW DELETE FUNCTION ---
const deleteBook = async (id) => {
  const { data } = await apiClient.delete(`/books/${id}`);
  return data;
};

// --- (BookForm is unchanged) ---
const BookForm = ({ book, onSuccess }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [isbn, setIsbn] = useState(book?.isbn || '');
  const [quantity, setQuantity] = useState(book?.quantity || 1);
  const [subject, setSubject] = useState(book?.subject?._id || '');
  const [classLevel, setClassLevel] = useState(book?.classLevel?._id || '');
  const { data: subjects } = useQuery({ queryKey: ['subjects'], queryFn: async () => (await apiClient.get('/subjects')).data });
  const { data: classes } = useQuery({ queryKey: ['classLevels'], queryFn: async () => (await apiClient.get('/classes')).data });
  const isEditMode = Boolean(book);
  const mutation = useMutation({
    mutationFn: isEditMode ? updateBook : createBook,
    onSuccess: () => {
      toast.success(
        `Book ${isEditMode ? 'updated' : 'added'} successfully!`
      );
      queryClient.invalidateQueries(['books']);
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? 'update' : 'add'} book`
      );
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    const bookData = { 
      title, 
      author, 
      isbn, 
      quantity: Number(quantity),
      subject: subject || null,
      classLevel: classLevel || null,
    };
    if (isEditMode) {
      mutation.mutate({ id: book._id, ...bookData });
    } else {
      mutation.mutate(bookData);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Book Title" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input label="Author" id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
      <Input label="ISBN (Optional)" id="isbn" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
      <Input label="Quantity" id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
      <select onChange={(e) => setSubject(e.target.value)} value={subject} className="w-full p-2 border rounded-md">
        <option value="">Select Subject (Optional)</option>
        {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
      </select>
      <select onChange={(e) => setClassLevel(e.target.value)} value={classLevel} className="w-full p-2 border rounded-md">
        <option value="">Select Class (Optional)</option>
        {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
      <Button type="submit" isLoading={mutation.isLoading}>
        {isEditMode ? 'Update Book' : 'Add Book'}
      </Button>
    </form>
  );
};


// --- Main Page Component (UPDATED) ---
const Books = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // <-- New State
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300); 

  const {
    data: booksData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['books', page, debouncedSearch],
    queryFn: () => fetchBooks(page, debouncedSearch),
    keepPreviousData: true,
  });

  // --- New Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: () => {
      toast.success('Book deleted successfully');
      queryClient.invalidateQueries(['books']);
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    },
  });

  const openAddModal = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };
  const openEditModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };
  const openDeleteModal = (book) => { // <-- New handler
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };
  const closeDeleteModal = () => { // <-- New handler
    setIsDeleteModalOpen(false);
    setSelectedBook(null);
  };

  const handleDownloadReport = async () => {
    // ... (unchanged)
  };

  if (isError) return <div>Error loading books.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Books</h1>

      {/* Header is unchanged */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownloadReport} className="flex items-center space-x-2 py-2 px-4 text-primary bg-white border border-primary rounded-md shadow-sm hover:bg-gray-50">
            <Download className="w-5 h-5" /><span>Download Report</span>
          </button>
          <button onClick={openAddModal} className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700">
            <Plus className="w-5 h-5" /><span>Add Book</span>
          </button>
        </div>
      </div>

      {/* Table is updated */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* ... (thead is unchanged) ... */}
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty (Avail)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
              )}
              {!isLoading && booksData.docs.map((book) => (
                <tr key={book._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{book.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.subject?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.quantity} ({book.quantityAvailable})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openEditModal(book)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-5 h-5" />
                    </button>
                    {/* --- DELETE BUTTON IS NOW WIRED --- */}
                    <button onClick={() => openDeleteModal(book)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {booksData && (
          <Pagination data={booksData} onPageChange={(newPage) => setPage(newPage)} />
        )}
      </div>

      {/* Add/Edit Modal (unchanged) */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={selectedBook ? 'Edit Book' : 'Add New Book'}>
        <BookForm book={selectedBook} onSuccess={closeModal} />
      </Modal>
      
      {/* --- NEW DELETE MODAL --- */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteMutation.mutate(selectedBook._id)}
        title="Delete Book"
        message={`Are you sure you want to delete "${selectedBook?.title}"? This action cannot be undone.`}
        isLoading={deleteMutation.isLoading}
      />
    </div>
  );
};

export default Books;