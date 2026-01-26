import { Outlet, Link, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import TopBar from './TopBar';
import { useState, useEffect } from 'react';

export default function Layout() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <TopBar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
