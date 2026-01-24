import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import toast from 'react-hot-toast';
import { Moon, Sun, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(email, password);
      if (result.success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error?.message || 
        error.message || 
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 transition-colors duration-300 flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 backdrop-blur-md bg-white/80 dark:bg-zinc-800/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between py-3 sm:py-4">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
              LLA
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white truncate">Lifting Live Arena</h1>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-ui hidden sm:block">Competition Management</p>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? (
              <Sun size={18} className="sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon size={18} className="sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md my-auto">
          {/* Card */}
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-5 sm:mb-8">
              <div className="flex justify-center mb-2 sm:mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white">
                  <LogIn size={24} className="sm:w-8 sm:h-8" />
                </div>
              </div>
              <h2 className="text-lg sm:text-2xl font-heading font-bold text-slate-900 dark:text-white mb-1">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-ui">Sign in to your admin account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@test.com"
                  className="input text-xs sm:text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full h-9 sm:h-12 text-xs sm:text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-5 sm:mt-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin">⏳</div>
                    <span className="hidden sm:inline">Signing in...</span>
                    <span className="sm:hidden">Signing in</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} className="sm:w-5 sm:h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-200 dark:border-zinc-700">
              <p className="text-xs text-slate-600 dark:text-zinc-400 text-center font-ui leading-normal">
                Test credentials:
                <br />
                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">admin@test.com / password123</span>
              </p>
            </div>
          </div>

          {/* Footer Text */}
          <div className="mt-4 sm:mt-6 text-center text-xs text-slate-600 dark:text-zinc-400 font-ui px-2">
            <p>© 2026 Lifting Live Arena. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
