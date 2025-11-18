// /frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // We MUST keep the 'content' array.
  // This tells Tailwind to scan all your .jsx files for classes.
  // The new automatic detection can miss things.
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  
  // 'theme' and 'plugins' are now moved to index.css
};