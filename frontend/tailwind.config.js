// /frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // blue-700
        secondary: '#6B7280', // gray-500
        background: '#F3F4F6', // gray-100
        surface: '#FFFFFF', // white
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // This plugin is still needed
  ],
};