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
import DevDashboard from './pages/DevDashboard';
import DevSchools from './pages/DevSchools.jsx';
import Plans from './pages/Plans.jsx';
import DevSettings from './pages/DevSettings.jsx';
import SchoolOverview from './pages/SchoolOverview.jsx';
import Settings from './pages/Settings.jsx';
import Books from './pages/Books.jsx';
import Students from './pages/Students.jsx';
import Staff from './pages/Staff.jsx';
import Categories from './pages/Categories.jsx';
import Resources from './pages/Resources.jsx';
import QuizBuilder from './pages/QuizBuilder.jsx';
import LibrarianDashboard from './pages/LibrarianDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import TeacherAssignments from './pages/TeacherAssignments.jsx';
import ViewSubmissions from './pages/ViewSubmissions.jsx';
import StudentPortal from './pages/StudentPortal.jsx';
import QuizGenerator from './features/quiz/QuizGenerator.jsx';
import MyBorrowed from './pages/MyBorrowed.jsx';
import StudentResources from './pages/StudentResources.jsx';
import ManualQuizList from './pages/ManualQuizList.jsx';
import TakeQuiz from './pages/TakeQuiz.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import StudentAssignments from './pages/StudentAssignments.jsx';
import AssignmentDetails from './pages/AssignmentDetails.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import Parents from './pages/Parents.jsx';
import Announcements from './pages/Announcements.jsx';
import GlobalAnnouncements from './pages/GlobalAnnouncements.jsx';
import SupportTickets from './pages/SupportTickets.jsx';
import AdminSupport from './pages/AdminSupport.jsx';
import TicketDetails from './pages/TicketDetails.jsx';
import ManageTimetables from './pages/ManageTimetables.jsx';
import StudentTimetable from './pages/StudentTimetable.jsx';
import QuizHistory from './pages/QuizHistory.jsx'; // <-- IMPORT REAL

// Placeholders
const NotFound = () => <div className="flex items-center justify-center h-screen"><h1 className="text-4xl font-bold">404 - Page Not Found</h1></div>;

// --- Role-Based Routing ---
const AppRoutes = () => {
  const { userInfo } = useAuth();

  // DEVELOPER
  if (userInfo?.role === 'Developer') {
    return (
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DevDashboard />} />
          <Route path="/schools" element={<DevSchools />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/dev/announcements" element={<GlobalAnnouncements />} />
          <Route path="/dev/support" element={<SupportTickets />} />
          <Route path="/support/ticket/:id" element={<TicketDetails />} />
          <Route path="/dev/settings" element={<DevSettings />} />
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
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/admin/timetables" element={<ManageTimetables />} />
          <Route path="/transactions" element={<LibrarianDashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/quiz-builder" element={<QuizBuilder />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/parents" element={<Parents />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/support" element={<AdminSupport />} />
          <Route path="/support/ticket/:id" element={<TicketDetails />} />
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
          <Route path="/announcements" element={<Announcements />} />
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
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/my-timetable" element={<StudentTimetable />} />
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
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/my-timetable" element={<StudentTimetable />} />
          <Route path="/my-books" element={<MyBorrowed />} />
          <Route path="/resources" element={<StudentResources />} />
          <Route path="/student/assignments" element={<StudentAssignments />} />
          <Route path="/student/assignment/:id" element={<AssignmentDetails />} />
          <Route path="/ai-quiz" element={<QuizGenerator />} />
          <Route path="/manual-quiz" element={<ManualQuizList />} />
          <Route path="/manual-quiz/:id" element={<TakeQuiz />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/quiz-history" element={<QuizHistory />} /> {/* <-- USE REAL */}
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
          <Route path="/announcements" element={<Announcements />} />
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-developer" element={<RegisterDeveloperPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/*" element={<AppRoutes />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;