import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, Trophy, Users, Calendar, Monitor, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Lifting Live Arena</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-6">
          <NavLink to="/" icon={<Home size={20} />} text="Dashboard" />
          <NavLink to="/technical" icon={<Monitor size={20} />} text="Technical Panel" />
          <NavLink to="/competitions" icon={<Trophy size={20} />} text="Competitions" />
          <NavLink to="/athletes" icon={<Users size={20} />} text="Athletes" />
          <NavLink to="/sessions" icon={<Calendar size={20} />} text="Sessions" />
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="mb-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
