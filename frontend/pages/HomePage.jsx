import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="mt-20 flex flex-col items-center text-center">
      <BookOpen size={80} className="text-indigo-600" />
      <h1 className="mt-6 text-5xl font-bold text-gray-900">
        Welcome to the Multi-School Library System
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-gray-600">
        The all-in-one solution for managing libraries across multiple
        institutions. Built with the MERN stack for speed and scalability.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          to="/login"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          <span>Get Started</span>
          <ArrowRight size={20} />
        </Link>
        <Link
          to="/register-dev"
          className="flex items-center gap-2 rounded-md bg-gray-700 px-6 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          <span>Developer Setup</span>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;