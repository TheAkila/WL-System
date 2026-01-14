import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

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
      toast.error('Failed to load sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">📋</div>
        <p className="text-gray-600 mb-4">No active sessions available</p>
        <p className="text-sm text-gray-500">Create a session from the Sessions page</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Select Session</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{session.name}</h3>
              <span
                className={`badge ${
                  session.status === 'in-progress'
                    ? 'badge-success'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {session.gender === 'male' ? '🚹 Men' : '🚺 Women'} •{' '}
              {session.weight_category}kg
            </p>
            {session.competition && (
              <p className="text-gray-500 text-xs mt-2">{session.competition.name}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
