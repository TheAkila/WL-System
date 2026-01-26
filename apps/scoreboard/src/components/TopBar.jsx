import ScrollingBanner from './ScrollingBanner';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TopBar({ darkMode, setDarkMode }) {
  const [competitionName, setCompetitionName] = useState('National Championship 2025');

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await api.get('/competitions/current');
        if (response.data?.data?.name) {
          setCompetitionName(response.data.data.name);
        }
      } catch (error) {
        console.error('Failed to fetch competition name:', error);
      }
    };

    fetchCompetition();
  }, []);

  const handleToggleDarkMode = () => {
    console.log('Button clicked!');
    console.log('Current darkMode state:', darkMode);
    const newValue = !darkMode;
    console.log('Setting darkMode to:', newValue);
    setDarkMode(newValue);
  };

  return (
    <>
      {/* Scrolling Banner */}
      <ScrollingBanner />
      
      {/* Main Header */}
      <div className="bg-white text-black sticky top-0 z-10 border-b border-slate-200">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-black tracking-tight">{competitionName}</h1>
              <p className="font-ui text-xs text-black mt-1 font-medium tracking-wider uppercase">Lifting Social</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleDarkMode}
                type="button"
                className="w-10 h-10 flex items-center justify-center bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-lg transition-colors flex-shrink-0"
                title={darkMode ? 'Light mode' : 'Dark mode'}
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <Sun size={22} className="text-yellow-500" strokeWidth={2} />
                ) : (
                  <Moon size={22} className="text-slate-800" strokeWidth={2} />
                )}
              </button>
              <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-none">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-ui text-xs font-bold text-white tracking-widest">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
