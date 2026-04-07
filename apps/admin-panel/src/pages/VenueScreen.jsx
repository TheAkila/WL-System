import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Radio, ExternalLink, Settings, LayoutTemplate, PlayCircle, Trophy } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function VenueScreen() {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      const data = response.data.data || [];
      setSessions(data);
      if (data.length > 0) {
        setSelectedSessionId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = () => {
    if (!selectedSessionId) {
      toast.error('Please select a session first');
      return;
    }
    window.open(`/venue-display/${selectedSessionId}`, '_blank');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">
          Venue Screen
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 font-ui">
          Configure and launch the competition display for projector or LED screens.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Active Display Panel */}
          <div className="card card-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                  <Monitor size={24} />
                </div>
                <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                  Available Screen Modes
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModeCard 
                icon={<LayoutTemplate size={24} />}
                title="Attempt Mode" 
                desc="Shows current lifter, attempt, weight, timer, and next lifter."
                color="blue"
              />
              <ModeCard 
                icon={<PlayCircle size={24} />}
                title="Result Flash" 
                desc="Displays GOOD LIFT / NO LIFT banner after referee decision."
                color="green"
              />
              <ModeCard 
                icon={<Trophy size={24} />}
                title="Leaderboard" 
                desc="Shows ranked table with snatch, clean and jerk, and total."
                color="purple"
              />
            </div>
            
            <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50">
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                <span className="font-semibold text-slate-900 dark:text-white">Note: </span> 
                Screen modes are automatically managed by the Technical Panel when judging is active.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600">
                <Radio size={24} />
              </div>
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                Quick Actions
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-2 font-heading">
                  Select Active Session
                </label>
                <select
                  className="w-full form-input bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  disabled={loading || sessions.length === 0}
                >
                  <option value="">Select a session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.status === 'in-progress' ? '(Live)' : ''}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleLaunch}
                className="w-full btn btn-primary flex justify-center items-center gap-2 py-3"
                disabled={!selectedSessionId}
              >
                <ExternalLink size={20} />
                <span>Launch Venue Display</span>
              </button>

              <Link
                to="/technical"
                className="w-full btn btn-secondary flex justify-center items-center gap-2 py-3"
              >
                <Settings size={20} />
                <span>Open Technical Panel</span>
              </Link>
            </div>
            
            <p className="mt-6 text-xs text-center text-slate-500 dark:text-zinc-500 font-ui">
              Requires a 16:9 1080p display for optimal viewing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200 dark:border-blue-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 border-purple-200 dark:border-purple-900/30',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-900/30',
  };

  return (
    <div className="flex flex-col p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:shadow-md transition-shadow">
      <div className={`p-3 rounded-xl mb-4 inline-flex self-start ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-zinc-400 font-ui leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
