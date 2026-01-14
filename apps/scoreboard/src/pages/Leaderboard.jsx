import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import api from '../services/api';
import SessionSelector from '../components/SessionSelector';
import LeaderboardCard from '../components/LeaderboardCard';

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
      <div className="p-4">
        <SessionSelector onSelectSession={(s) => {
          setSessionId(s.id);
          setSession(s);
        }} />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Live Rankings</h2>
        {session && (
          <div className="text-sm opacity-90">
            <p>{session.name}</p>
            <p>{session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg</p>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((athlete) => (
            <LeaderboardCard key={athlete.athlete_id} athlete={athlete} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <div className="text-5xl mb-3">📊</div>
          <p>No rankings available yet</p>
          <p className="text-sm mt-2">Athletes will appear after completing attempts</p>
        </div>
      )}

      {/* Change Session */}
      <button
        onClick={() => setSessionId(null)}
        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
      >
        Change Session
      </button>
    </div>
  );
}
