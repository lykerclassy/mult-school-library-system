// frontend/src/hooks/useSidebar.js

import { create } from 'zustand';

// We use 'zustand' for simple global state without context providers
// Run: npm install zustand
const useSidebarStore = create((set) => ({
  isOpen: true,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export default useSidebarStore;