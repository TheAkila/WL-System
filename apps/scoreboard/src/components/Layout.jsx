import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';
import { useState, useEffect, useCallback } from 'react';

export default function Layout() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    console.log('Initializing darkMode from localStorage:', saved);
    return saved === 'true';
  });

  useEffect(() => {
    console.log('useEffect: darkMode changed to:', darkMode);
    if (darkMode) {
      console.log('Adding dark class to document.documentElement');
      document.documentElement.classList.add('dark');
    } else {
      console.log('Removing dark class from document.documentElement');
      document.documentElement.classList.remove('dark');
    }
    console.log('Current classes on html:', document.documentElement.className);
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const handleSetDarkMode = useCallback((newValue) => {
    console.log('handleSetDarkMode called with:', newValue);
    setDarkMode(newValue);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <TopBar darkMode={darkMode} setDarkMode={handleSetDarkMode} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
