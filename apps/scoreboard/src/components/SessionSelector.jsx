import { useState, useEffect } from 'react';
import api from '../services/api';

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
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin text-4xl mb-3">⏳</div>
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-5xl mb-3">🏋️</div>
        <p className="text-gray-600 mb-2">No active sessions</p>
        <p className="text-sm text-gray-500">Check back when a session starts</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Select a Session</h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="w-full text-left p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{session.name}</h3>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  session.status === 'in-progress'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {session.gender === 'male' ? '🚹 Men' : '🚺 Women'} •{' '}
              {session.weight_category}kg
            </p>
            {session.competition && (
              <p className="text-xs text-gray-500 mt-1">{session.competition.name}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
