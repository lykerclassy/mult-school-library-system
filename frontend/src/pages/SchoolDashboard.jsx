import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Users,
  Book,
  UserPlus,
  Loader2,
  List,
  Building,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- NEW: axios instance to avoid double /api issues ---
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE });
// debug help
console.debug('SchoolDashboard using API base:', api.defaults.baseURL);

// Define our tabs
const TABS = {
  STUDENTS: 'students',
  BOOKS: 'books',
  LIBRARIANS: 'librarians',
};

const SchoolDashboard = () => {
  const { userInfo } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.STUDENTS);
  const navigate = useNavigate();
  const location = useLocation();
  // Add state for school info
  const [schoolInfo, setSchoolInfo] = useState(null);

  // Add school info fetch
  useEffect(() => {
    const fetchSchoolInfo = async () => {
      if (!userInfo?.school) return;
      try {
        const { data } = await api.get(`/schools/${userInfo.school}`);
        setSchoolInfo(data);
      } catch (error) {
        toast.error('Failed to fetch school information');
      }
    };
    fetchSchoolInfo();
  }, [userInfo]);

  // Redirect to canonical school dashboard path when an admin logs in
  useEffect(() => {
    if (!userInfo) return;
    if (userInfo.role === 'SCHOOL_ADMIN' && location.pathname !== '/school-dashboard') {
      navigate('/school-dashboard', { replace: true });
    }
  }, [userInfo, location.pathname, navigate]);

  const TabButton = ({ tabId, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex items-center gap-2 rounded-t-lg px-4 py-3 font-medium transition-colors ${
        activeTab === tabId
          ? 'border-b-4 border-indigo-600 bg-white text-indigo-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        {schoolInfo?.name || 'School Dashboard'}
      </h1>
      <h2 className="mb-6 text-xl text-gray-700">
        Welcome, {userInfo.email}!
      </h2>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <TabButton
          tabId={TABS.STUDENTS}
          label="Manage Students"
          icon={<Users size={20} />}
        />
        <TabButton
          tabId={TABS.BOOKS}
          label="Manage Books"
          icon={<Book size={20} />}
        />
        {/* Only Admins can see the Librarians tab */}
        {userInfo.role === 'SCHOOL_ADMIN' && (
          <TabButton
            tabId={TABS.LIBRARIANS}
            label="Manage Librarians"
            icon={<UserPlus size={20} />}
          />
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === TABS.STUDENTS && <ManageStudents />}
        {activeTab === TABS.BOOKS && <ManageBooks />}
        {activeTab === TABS.LIBRARIANS && <ManageLibrarians />}
      </div>
    </div>
  );
};

// --- Sub-Component: Manage Students ---
// We define this inside the same file for "vibe coding" simplicity
const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  // Form state
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [stream, setStream] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [dorm, setDorm] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students'); // was axios.get('/api/students')
      setStudents(data);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const clearForm = () => {
    setName('');
    setStudentId('');
    setStudentClass('');
    setStream('');
    setParentPhone('');
    setDorm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/students', { // was axios.post('/api/students', ...)
        name,
        studentId,
        class: studentClass,
        stream,
        parentPhone,
        dorm,
      });
      toast.success('Student added!');
      clearForm();
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add student');
    }
    setFormLoading(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-1">
        <h3 className="mb-4 text-xl font-semibold">Add New Student</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="Student ID (e.g., ADM123)" value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="Class (e.g., Form 1)" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="Stream (e.g., North)" value={stream} onChange={(e) => setStream(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="Dorm (e.g., Block A)" value={dorm} onChange={(e) => setDorm(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="tel" placeholder="Parent's Phone" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
          <button type="submit" disabled={formLoading} className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
            {formLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {formLoading ? 'Adding...' : 'Add Student'}
          </button>
        </form>
      </div>
      {/* List */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-2">
        <h3 className="mb-4 text-xl font-semibold">All Students</h3>
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <ul className="h-96 space-y-3 overflow-y-auto">
            {students.length === 0 && (
              <p className="text-center text-gray-500">No students found.</p>
            )}
            {students.map((s) => (
              <li key={s._id} className="rounded border border-gray-200 p-3">
                <p className="font-bold">{s.name} ({s.studentId})</p>
                <p className="text-sm text-gray-600">Class: {s.class} {s.stream}</p>
                {s.dorm && <p className="text-sm text-gray-600">Dorm: {s.dorm}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Manage Books ---
const ManageBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [formLoading, setFormLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/books'); // was axios.get('/api/books')
      setBooks(data);
    } catch (error) {
      toast.error('Failed to fetch books');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const clearForm = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setQuantity(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/books', { title, author, isbn, quantity }); // was axios.post('/api/books', ...)
      toast.success('Book added!');
      clearForm();
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add book');
    }
    setFormLoading(false);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-1">
        <h3 className="mb-4 text-xl font-semibold">Add New Book</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="text" placeholder="ISBN (Optional)" value={isbn} onChange={(e) => setIsbn(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" required className="w-full rounded-md border-gray-300 shadow-sm" />
          <button type="submit" disabled={formLoading} className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
            {formLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {formLoading ? 'Adding...' : 'Add Book'}
          </button>
        </form>
      </div>
      {/* List */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-2">
        <h3 className="mb-4 text-xl font-semibold">All Books</h3>
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <ul className="h-96 space-y-3 overflow-y-auto">
            {books.length === 0 && (
              <p className="text-center text-gray-500">No books found.</p>
            )}
            {books.map((b) => (
              <li key={b._id} className="rounded border border-gray-200 p-3">
                <p className="font-bold">{b.title}</p>
                <p className="text-sm text-gray-600">by {b.author}</p>
                <p className="text-sm font-semibold text-gray-800">Available: {b.available} / {b.quantity}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Manage Librarians ---
const ManageLibrarians = () => {
  const [librarians, setLibrarians] = useState([]);
  const [loading, setLoading] = useState(true);
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/librarians'); // was axios.get('/api/users/librarians')
      setLibrarians(data);
    } catch (error) {
      toast.error('Failed to fetch librarians');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const clearForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/users/add-librarian', { name, email, password }); // was axios.post('/api/users/add-librarian', ...)
      toast.success('Librarian added!');
      clearForm();
      fetchLibrarians();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add librarian');
    }
    setFormLoading(false);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Form */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-1">
        <h3 className="mb-4 text-xl font-semibold">Add New Librarian</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-md border-gray-300 shadow-sm" />
          <button type="submit" disabled={formLoading} className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
            {formLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {formLoading ? 'Adding...' : 'Add Librarian'}
          </button>
        </form>
      </div>
      {/* List */}
      <div className="rounded-lg bg-white p-6 shadow-xl md:col-span-2">
        <h3 className="mb-4 text-xl font-semibold">All Librarians</h3>
        {loading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <ul className="h-96 space-y-3 overflow-y-auto">
            {librarians.length === 0 && (
              <p className="text-center text-gray-500">No librarians found.</p>
            )}
            {librarians.map((l) => (
              <li key={l._id} className="rounded border border-gray-200 p-3">
                <p className="font-bold">{l.name}</p>
                <p className="text-sm text-gray-600">{l.email}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;