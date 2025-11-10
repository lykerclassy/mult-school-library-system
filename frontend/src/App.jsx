import React from "react";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterDevPage from "./pages/RegisterDevPage";
import DashboardRedirectPage from "./pages/DashboardRedirectPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DevDashboard from "./pages/DevDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import LibrarianDashboard from "./pages/LibrarianDashboard";
import { Routes, Route } from "react-router-dom";
import axios from "axios";

// Set API base URL (optional, helpful)
axios.defaults.baseURL = "http://localhost:5000/api";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <Toaster position="top-right" />
      <main className="container mx-auto max-w-7xl p-4">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register-dev" element={<RegisterDevPage />} />
        
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardRedirectPage />} />
            <Route path="/developer-dashboard" element={<DevDashboard />} />
            <Route path="/school-dashboard" element={<SchoolDashboard />} />
            <Route path="/librarian-dashboard" element={<LibrarianDashboard />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;