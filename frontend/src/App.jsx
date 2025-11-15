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
import Plans from './pages/Plans.jsx';

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

// Teacher
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import TeacherAssignments from './pages/TeacherAssignments.jsx';
import ViewSubmissions from './pages/ViewSubmissions.jsx';

// Student
import StudentPortal from './pages/StudentPortal.jsx';
import QuizGenerator from './features/quiz/QuizGenerator.jsx';
import MyBorrowed from './pages/MyBorrowed.jsx';
import StudentResources from './pages/StudentResources.jsx';
import ManualQuizList from './pages/ManualQuizList.jsx';
import TakeQuiz from './pages/TakeQuiz.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StudentAssignments from './pages/StudentAssignments.jsx';
import AssignmentDetails from './pages/AssignmentDetails.jsx';

// Parent
import ParentDashboard from './pages/ParentDashboard.jsx';
import Parents from './pages/Parents.jsx';

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
          <Route path="/plans" element={<Plans />} />
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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/parents" element={<Parents />} />
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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // TEACHER
  if (userInfo?.role === 'Teacher') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<TeacherDashboard />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/assignment/:id/submissions" element={<ViewSubmissions />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/quiz-builder" element={<QuizBuilder />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
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
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignment/:id" element={<AssignmentDetails />} />
          <Route path="/ai-quiz" element={<QuizGenerator />} />
          <Route path="/manual-quiz" element={<ManualQuizList />} />
          <Route path="/manual-quiz/:id" element={<TakeQuiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/quiz-history" element={<QuizHistory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // PARENT
  if (userInfo?.role === 'Parent') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ParentDashboard />} />
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