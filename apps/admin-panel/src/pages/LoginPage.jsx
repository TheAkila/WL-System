import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Loader2, Moon, Sun, Trophy, Shield } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const { login } = useAuth();
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
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error already handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-900 dark:to-zinc-950 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 p-3 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl mb-6 shadow-xl shadow-red-600/20">
            <Trophy size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-heading text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Lifting Live Arena
          </h1>
          <p className="font-ui text-slate-600 dark:text-zinc-400 text-sm">
            Competition Management System
          </p>
        </div>

        {/* Login Card */}
        <div className="card card-lg mb-6">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-zinc-700">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900 dark:text-white">Admin Access</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-500">Sign in to manage your competition</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-6 py-3"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-700">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Demo Credentials
            </p>
            <div className="bg-slate-50 dark:bg-zinc-800 rounded-xl p-4 space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-700 dark:text-zinc-300 mb-1">Admin Account</p>
                <p className="text-slate-600 dark:text-zinc-400 font-mono text-xs">admin@test.com</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 dark:text-zinc-300 mb-1">Technical Account</p>
                <p className="text-slate-600 dark:text-zinc-400 font-mono text-xs">tech@test.com</p>
              </div>
              <div>
                <p className="font-medium text-slate-700 dark:text-zinc-300 mb-1">Password</p>
                <code className="inline-block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg text-xs text-slate-900 dark:text-white font-mono">
                  password123
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-zinc-500">
            🔒 Authorized Officials Only
          </p>
          <p className="text-xs text-slate-400 dark:text-zinc-600 mt-2">
            © {new Date().getFullYear()} Lifting Live Arena
          </p>
        </div>
      </div>
    </div>
  );
}
