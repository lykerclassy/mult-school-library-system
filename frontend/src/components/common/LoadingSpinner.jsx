// frontend/src/components/common/LoadingSpinner.jsx

import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
      <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
      <p className="text-gray-500 text-sm mt-2">Please wait while we secure your session.</p>
    </div>
  );
};

export default LoadingSpinner;