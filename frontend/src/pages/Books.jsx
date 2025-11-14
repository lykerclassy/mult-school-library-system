// frontend/src/pages/Books.jsx

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// --- API Functions ---
const fetchBooks = async () => {
  const { data } = await apiClient.get('/books');
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

// --- Book Form (for Add/Edit) ---
const BookForm = ({ book, onSuccess }) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [isbn, setIsbn] = useState(book?.isbn || '');
  const [quantity, setQuantity] = useState(book?.quantity || 1);

  const isEditMode = Boolean(book);

  const mutation = useMutation({
    mutationFn: isEditMode ? updateBook : createBook,
    onSuccess: () => {
      toast.success(
        `Book ${isEditMode ? 'updated' : 'added'} successfully!`
      );
      queryClient.invalidateQueries(['books']);
      onSuccess(); // Close the modal
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
    const bookData = { title, author, isbn, quantity: Number(quantity) };
    if (isEditMode) {
      mutation.mutate({ id: book._id, ...bookData });
    } else {
      mutation.mutate(bookData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Book Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Input
        label="Author"
        id="author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <Input
        label="ISBN (Optional)"
        id="isbn"
        value={isbn}
        onChange={(e) => setIsbn(e.target.value)}
      />
      <Input
        label="Quantity"
        id="quantity"
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <Button type="submit" isLoading={mutation.isLoading}>
        {isEditMode ? 'Update Book' : 'Add Book'}
      </Button>
    </form>
  );
};

// --- Main Page Component ---
const Books = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [books, searchTerm]);

  const openAddModal = () => {
    setSelectedBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  if (isLoading) return <div>Loading books...</div>;
  if (isError) return <div>Error loading books.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Books</h1>

      {/* Header: Search and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-md">
          <Input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Add Book</span>
        </button>
      </div>

      {/* Books Table */}
      <div className="bg-surface rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ISBN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Qty (Avail)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.isbn || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {book.quantity} ({book.quantityAvailable})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEditModal(book)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedBook ? 'Edit Book' : 'Add New Book'}
      >
        <BookForm book={selectedBook} onSuccess={closeModal} />
      </Modal>
    </div>
  );
};

export default Books;