// frontend/src/components/common/Input.jsx

import React from 'react';

const Input = React.forwardRef(
  ({ type = 'text', label, id, error, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
        <input
          type={type}
          id={id}
          ref={ref}
          {...props}
          className={`w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary ${
            error
              ? 'border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300'
          }`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

export default Input;