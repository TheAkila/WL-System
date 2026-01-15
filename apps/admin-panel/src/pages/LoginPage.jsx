import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <div className="font-heading text-6xl font-black text-black mb-4">LIFTING LIVE</div>
          <h2 className="font-heading text-2xl font-black text-black mb-2">ARENA</h2>
          <p className="font-ui text-sm font-bold text-black tracking-widest uppercase">Official Admin Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-4 border-black p-8 shadow-brand mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="label">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="label">
                <Lock size={16} className="inline mr-2" />
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-8"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-8 border-t-4 border-black">
            <p className="font-heading font-bold text-black mb-4 uppercase tracking-widest">Demo Credentials</p>
            <div className="bg-gray-100 border-2 border-black p-4 space-y-2 font-ui text-sm">
              <div className="font-bold text-black">Admin:</div>
              <p className="text-black ml-2">📧 admin@test.com</p>
              <div className="font-bold text-black mt-4">Technical:</div>
              <p className="text-black ml-2">📧 tech@test.com</p>
              <div className="font-bold text-black mt-4">Password:</div>
              <p className="text-black ml-2 font-mono bg-white border border-black px-2 py-1">password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center font-ui text-xs font-bold text-black tracking-widest uppercase">
          <p>Authorized Officials Only</p>
        </div>
      </div>
    </div>
  );
}
