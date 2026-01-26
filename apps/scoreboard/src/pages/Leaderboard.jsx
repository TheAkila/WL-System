import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import api from '../services/api';
import SessionSelector from '../components/SessionSelector';
import LeaderboardCard from '../components/LeaderboardCard';
import { Trophy, Medal, Award, Users, Weight } from 'lucide-react';

export default function Leaderboard() {
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const { leaderboard } = useRealtimeUpdates(sessionId);

  useEffect(() => {
    const fetchSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlSessionId = params.get('session');

      if (urlSessionId) {
        setSessionId(urlSessionId);
        try {
          const response = await api.get(`/technical/sessions/active`);
          const foundSession = response.data.data.find(s => s.id === urlSessionId);
          if (foundSession) setSession(foundSession);
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      }
    };

    fetchSession();
  }, []);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 text-slate-900 dark:text-white pt-20">
        <div className="px-6 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-black mb-6 leading-none tracking-tight">
              Live Rankings
            </h1>
            <p className="font-body text-lg sm:text-xl text-slate-600 dark:text-zinc-400">
              Select a session to view the leaderboard
            </p>
          </div>
          <SessionSelector onSelectSession={(s) => {
            setSessionId(s.id);
            setSession(s);
          }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-slate-900 dark:text-white pb-20 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 sticky top-20 z-10">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-900 dark:bg-slate-700 flex items-center justify-center rounded-lg">
                <Trophy className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                  Rankings
                </h1>
                {session && (
                  <div className="flex items-center gap-2 mt-2 font-ui text-sm text-slate-600 dark:text-zinc-400">
                    <Users className="w-4 h-4" />
                    <span>{session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSessionId(null)}
              className="hidden sm:block btn btn-primary btn-sm"
            >
              Change
            </button>
          </div>
          {session && (
            <p className="font-body text-sm text-slate-500 dark:text-zinc-500">{session.name} • {session.competition?.name}</p>
          )}
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {leaderboard && leaderboard.length > 0 ? (
          <div className="space-y-4">
            {leaderboard.map((athlete, index) => (
              <LeaderboardCard 
                key={athlete.athlete_id} 
                athlete={athlete}
                position={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 p-12 text-center rounded-xl">
            <div className="w-20 h-20 bg-slate-900 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6 rounded-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-black text-slate-900 dark:text-white mb-3">
              No Rankings Yet
            </h3>
            <p className="font-body text-slate-600 dark:text-zinc-400">
              Athletes will appear here after completing their attempts
            </p>
          </div>
        )}

        {/* Mobile Change Session */}
        <button
          onClick={() => setSessionId(null)}
          className="sm:hidden w-full mt-8 py-4 btn btn-primary"
        >
          Change Session
        </button>
      </div>
    </div>
  );
}
