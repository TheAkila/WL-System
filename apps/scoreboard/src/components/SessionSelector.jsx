import { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2, Trophy, Users, Weight, Calendar } from 'lucide-react';

export default function SessionSelector({ onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/technical/sessions/active');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-12 text-center rounded-xl">
        <Loader2 className="w-12 h-12 text-slate-600 dark:text-zinc-400 animate-spin mx-auto mb-4" />
        <p className="font-body text-slate-600 dark:text-zinc-400 text-lg">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-12 text-center rounded-xl">
        <div className="w-20 h-20 bg-slate-900 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6 rounded-lg">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h3 className="font-heading text-3xl font-black text-slate-900 dark:text-white mb-3">
          No Active Sessions
        </h3>
        <p className="font-body text-slate-600 dark:text-zinc-400">Check back when a session starts</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-6 rounded-xl">
      <h2 className="font-heading text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Select a Session</h2>
      <div className="space-y-4">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="w-full text-left p-6 border-2 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-slate-900 dark:hover:bg-slate-700 hover:text-white transition-all group rounded-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white group-hover:text-white transition-colors tracking-tight">
                {session.name}
              </h3>
              <span
                className={`px-4 py-2 text-xs font-ui font-bold uppercase tracking-widest rounded ${
                  session.status === 'in-progress'
                    ? 'bg-slate-900 dark:bg-slate-700 text-white group-hover:bg-white group-hover:text-slate-900'
                    : 'bg-slate-100 dark:bg-zinc-700 text-slate-900 dark:text-white group-hover:bg-white group-hover:text-slate-900'
                }`}
              >
                {session.status === 'in-progress' ? 'Live' : session.status}
              </span>
            </div>
            <div className="flex items-center gap-3 font-ui text-sm text-slate-600 dark:text-zinc-400 group-hover:text-white">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {session.gender === 'male' ? 'Men' : 'Women'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Weight className="w-4 h-4" />
                {session.weight_category}kg
              </span>
            </div>
            {session.competition && (
              <p className="font-body text-xs text-gray-600 group-hover:text-white mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {session.competition.name}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
