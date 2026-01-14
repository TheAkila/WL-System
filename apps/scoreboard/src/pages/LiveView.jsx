import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import api from '../services/api';
import SessionSelector from '../components/SessionSelector';
import LiveAttemptCard from '../components/LiveAttemptCard';
import UpcomingAthletes from '../components/UpcomingAthletes';

export default function LiveView() {
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [liftingOrder, setLiftingOrder] = useState([]);
  const { currentAttempt, session: liveSession } = useRealtimeUpdates(sessionId);

  // Fetch session details
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

  // Update session from realtime
  useEffect(() => {
    if (liveSession) {
      setSession(liveSession);
    }
  }, [liveSession]);

  // Fetch lifting order
  useEffect(() => {
    const fetchLiftingOrder = async () => {
      if (!sessionId) return;
      
      try {
        const response = await api.get(`/technical/sessions/${sessionId}/lifting-order`);
        setLiftingOrder(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch lifting order:', error);
      }
    };

    if (sessionId) {
      fetchLiftingOrder();
      // Refresh every 10 seconds
      const interval = setInterval(fetchLiftingOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [sessionId, currentAttempt]);

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
      {/* Session Info */}
      {session && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-bold text-lg mb-2">{session.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{session.gender === 'male' ? '🚹 Men' : '🚺 Women'}</span>
            <span>•</span>
            <span>{session.weight_category}kg</span>
            <span>•</span>
            <span className="uppercase font-semibold text-blue-600">
              {session.current_lift === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
            </span>
          </div>
          {session.competition && (
            <p className="text-xs text-gray-500 mt-2">{session.competition.name}</p>
          )}
        </div>
      )}

      {/* Current Attempt */}
      <LiveAttemptCard attempt={currentAttempt} />

      {/* Upcoming Athletes */}
      <UpcomingAthletes athletes={liftingOrder.slice(0, 5)} />

      {/* Change Session Button */}
      <button
        onClick={() => setSessionId(null)}
        className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
      >
        Change Session
      </button>
    </div>
  );
}
