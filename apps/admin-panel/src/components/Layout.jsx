import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Trophy, Users, Calendar, Monitor, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { path: '/technical', icon: <Monitor size={20} />, label: 'Technical Panel' },
    { path: '/competitions', icon: <Trophy size={20} />, label: 'Competitions' },
    { path: '/athletes', icon: <Users size={20} />, label: 'Athletes' },
    { path: '/sessions', icon: <Calendar size={20} />, label: 'Sessions' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-40 bg-white border-b-4 border-black">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-black text-black">LIFTING LIVE ARENA</h1>
            <p className="font-ui text-xs font-bold text-black tracking-widest mt-1">ADMIN PANEL</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="font-heading font-bold text-black">{user?.name}</span>
              <span className="font-ui text-xs text-gray-600 uppercase tracking-widest">{user?.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-3 hover:bg-gray-100 rounded-lg border-2 border-black transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="relative h-screen w-64 bg-white border-r-4 border-black">
          <nav className="pt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-6 py-4 font-heading font-bold tracking-wide transition-all ${
                  location.pathname === item.path
                    ? 'bg-black text-white border-r-4 border-black'
                    : 'text-black hover:bg-gray-100 border-r-4 border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t-4 border-black">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 btn btn-secondary w-full justify-center"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
