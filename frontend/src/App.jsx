// /frontend/src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LoginPage from './pages/LoginPage';
import RegisterDeveloperPage from './pages/RegisterDeveloperPage';

// --- Feature Pages ---
// Developer
import DevDashboard from './pages/DevDashboard';

// School Admin
import SchoolOverview from './pages/SchoolOverview.jsx';
import Settings from './pages/Settings.jsx';
import Books from './pages/Books.jsx';
import Students from './pages/Students.jsx';
import Staff from './pages/Staff.jsx';
import Categories from './pages/Categories.jsx';
import Resources from './pages/Resources.jsx';
import QuizBuilder from './pages/QuizBuilder.jsx';

// Librarian
import LibrarianDashboard from './pages/LibrarianDashboard.jsx';

// Student
import StudentPortal from './pages/StudentPortal.jsx';
import QuizGenerator from './features/quiz/QuizGenerator.jsx';
import MyBorrowed from './pages/MyBorrowed.jsx';
import StudentResources from './pages/StudentResources.jsx';
import ManualQuizList from './pages/ManualQuizList.jsx'; // <-- IMPORT REAL
import TakeQuiz from './pages/TakeQuiz.jsx'; // <-- IMPORT REAL
import Leaderboard from './pages/Leaderboard.jsx'; // <-- IMPORT REAL

// Placeholders
const QuizHistory = () => <div>Quiz History Page</div>;

// A simple 404 page
const NotFound = () => (
  <div className="flex items-center justify-center h-screen">
    <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
  </div>
);

// --- Role-Based Routing ---
const AppRoutes = () => {
  const { userInfo } = useAuth();

  // DEVELOPER
  if (userInfo?.role === 'Developer') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DevDashboard />} />
          <Route path="/schools" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // SCHOOL ADMIN
  if (userInfo?.role === 'SchoolAdmin') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<SchoolOverview />} />
          <Route path="/transactions" element={<LibrarianDashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/quiz-builder" element={<QuizBuilder />} />
          <Route path="/leaderboard" element={<Leaderboard />} /> {/* <-- Admin can see too */}
          <Route path="/students" element={<Students />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // LIBRARIAN
  if (userInfo?.role === 'Librarian') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<LibrarianDashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/quiz-builder" element={<QuizBuilder />} />
          <Route path="/leaderboard" element={<Leaderboard />} /> {/* <-- Librarian can see too */}
          <Route path="/students" element={<Students />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // STUDENT
  if (userInfo?.role === 'Student') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<StudentPortal />} />
          <Route path="/my-books" element={<MyBorrowed />} />
          <Route path="/resources" element={<StudentResources />} />
          <Route path="/ai-quiz" element={<QuizGenerator />} />
          <Route path="/manual-quiz" element={<ManualQuizList />} /> {/* <-- USE REAL */}
          <Route path="/manual-quiz/:id" element={<TakeQuiz />} /> {/* <-- NEW DYNAMIC ROUTE */}
          <Route path="/leaderboard" element={<Leaderboard />} /> {/* <-- USE REAL */}
          <Route path="/quiz-history" element={<QuizHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // Fallback
  return <Routes><Route path="*" element={<NotFound />} /></Routes>;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-developer" element={<RegisterDeveloperPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppRoutes />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;