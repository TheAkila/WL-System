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
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-800 border-t border-slate-200 dark:border-zinc-700 z-20">
      <div className="grid grid-cols-4 max-w-7xl mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-4 px-2 transition-all duration-200 font-ui ${
                isActive
                  ? 'bg-slate-900 dark:bg-slate-700 text-white'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700'
              }`
            }
          >
            <Icon size={22} strokeWidth={2.5} />
            <span className="text-[10px] sm:text-xs mt-1.5 font-bold tracking-widest uppercase">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
