import { NavLink } from 'react-router-dom';
import { Play, Trophy, Medal, FileText } from 'lucide-react';

export default function BottomNavigation() {
  const navItems = [
    { to: '/live', icon: Play, label: 'Live' },
    { to: '/leaderboard', icon: Trophy, label: 'Rankings' },
    { to: '/medals', icon: Medal, label: 'Medals' },
    { to: '/results', icon: FileText, label: 'Results' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="grid grid-cols-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-3 transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`
            }
          >
            <Icon size={24} strokeWidth={2} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
