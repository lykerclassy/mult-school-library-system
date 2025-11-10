import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),       // this enables React JSX transformation
    tailwindcss(), // this keeps Tailwind working
  ],
});
