// frontend/src/components/common/Button.jsx

import React from 'react';
import { twMerge } from 'tailwind-merge'; // <-- 1. Import twMerge

const Button = ({
  children,
  type = 'button',
  isLoading = false,
  className, // <-- 2. Explicitly get className from props
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={isLoading}
      // 3. Use twMerge to combine default styles with passed-in styles
      className={twMerge(
        'w-full py-2 px-4 text-white bg-primary rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center',
        className // This will now correctly override 'w-full' when you pass 'w-auto'
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;