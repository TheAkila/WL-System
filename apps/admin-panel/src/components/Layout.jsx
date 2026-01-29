import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Users, Calendar, Monitor, LogOut, Moon, Sun, Flag, Scale, Shield, Settings, Menu, X, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem('sidebarOpen') !== 'false';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen);
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/competitions', icon: <Trophy size={20} />, label: 'Competitions' },
    { path: '/registrations', icon: <ClipboardList size={20} />, label: 'Registrations' },
    { path: '/sessions', icon: <Calendar size={20} />, label: 'Sessions' },
    { path: '/teams', icon: <Flag size={20} />, label: 'Teams' },
    { path: '/athletes', icon: <Users size={20} />, label: 'Athletes' },
    { path: '/weigh-in', icon: <Scale size={20} />, label: 'Weigh-In' },
    { path: '/technical', icon: <Monitor size={20} />, label: 'Technical Panel' },
  ];

  const adminNavItems = [
    { path: '/users', icon: <Shield size={20} />, label: 'User Management' },
    { path: '/settings', icon: <Settings size={20} />, label: 'System Settings' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 backdrop-blur-md bg-white/80 dark:bg-zinc-800/80">
        <div className="flex items-center justify-between py-2 px-8 h-full">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <img src="/lifting-social-logo.svg" alt="Lifting Social" className="w-12 h-12" />
            <div>
              <h1 className="text-lg font-heading font-bold text-slate-900 dark:text-white">Competition Management System</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-ui">Powered by LiftingSocial</p>
            </div>
          </div>

          {/* Right: User Info and Controls */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex flex-col items-end">
              <span className="font-heading font-semibold text-slate-900 dark:text-white text-sm">{user?.name}</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400 font-ui uppercase tracking-wide">{user?.role}</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-700"></div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <Sun size={20} className="text-yellow-500" />
                ) : (
                  <Moon size={20} className="text-slate-600" />
                )}
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <X size={20} className="text-slate-600 dark:text-zinc-400" />
                ) : (
                  <Menu size={20} className="text-slate-600 dark:text-zinc-400" />
                )}
              </button>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-600 dark:text-zinc-400"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-0">
        {/* Sidebar Navigation */}
        <aside className={`fixed left-0 top-20 bottom-0 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 overflow-y-auto transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'w-64' : 'w-0'
        }`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg font-ui font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <>
                <div className="my-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                  <p className="px-4 mb-2 text-xs font-ui font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">
                    Administration
                  </p>
                </div>
                {adminNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg font-ui font-medium transition-all duration-200 whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} mt-20 p-8`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
