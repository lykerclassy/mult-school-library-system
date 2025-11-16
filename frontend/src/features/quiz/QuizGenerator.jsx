// frontend/src/features/quiz/QuizGenerator.jsx

import React from 'react';
import { Sparkles } from 'lucide-react';

const QuizGenerator = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Quiz Generator</h1>
      
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow">
        <Sparkles className="w-24 h-24 text-primary opacity-50 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Feature Coming Soon!</h2>
        <p className="text-gray-500 text-center max-w-md">
          Our advanced AI-powered quiz generator is currently under development.
          We are working hard to bring you this feature as soon as possible.
        </p>
      </div>
    </div>
  );
};

export default QuizGenerator;