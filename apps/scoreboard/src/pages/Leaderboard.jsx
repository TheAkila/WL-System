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
      <div className="min-h-screen bg-white text-black">
        <div className="px-6 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-black mb-6 leading-none tracking-tight">
              Live Rankings
            </h1>
            <p className="font-body text-lg sm:text-xl text-black">
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
    <div className="min-h-screen bg-white text-black pb-20">
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="px-6 py-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-black flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight">
                  Rankings
                </h1>
                {session && (
                  <div className="flex items-center gap-2 mt-2 font-ui text-sm text-black">
                    <Users className="w-4 h-4" />
                    <span>{session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setSessionId(null)}
              className="hidden sm:block px-6 py-2 bg-black text-white font-ui font-bold hover:bg-gray-800 transition-colors"
            >
              Change
            </button>
          </div>
          {session && (
            <p className="font-body text-sm text-gray-600">{session.name} • {session.competition?.name}</p>
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
          <div className="bg-white border border-black p-12 text-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-heading text-2xl font-black text-black mb-3">
              No Rankings Yet
            </h3>
            <p className="font-body text-black">
              Athletes will appear here after completing their attempts
            </p>
          </div>
        )}

        {/* Mobile Change Session */}
        <button
          onClick={() => setSessionId(null)}
          className="sm:hidden w-full mt-8 py-4 bg-white border-2 border-black text-black font-ui font-bold hover:bg-black hover:text-white transition-colors"
        >
          Change Session
        </button>
      </div>
    </div>
  );
}
