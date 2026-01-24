import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import api from '../services/api';
import socketService from '../services/socket';
import SessionSelector from '../components/SessionSelector';
import LiveAttemptCard from '../components/LiveAttemptCard';
import UpcomingAthletes from '../components/UpcomingAthletes';
import NotificationDisplay from '../components/NotificationDisplay';
import Timer from '../components/Timer';
import RefereeDecisionCompact from '../components/RefereeDecisionCompact';
import { Trophy, Users, Weight } from 'lucide-react';

export default function LiveView() {
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [liftingOrder, setLiftingOrder] = useState([]);
  const { currentAttempt, session: liveSession, timer } = useRealtimeUpdates(sessionId);

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
      <div className="min-h-screen bg-white text-black">
        <div className="px-6 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-black mb-6 leading-none tracking-tight">
              Watch Live
            </h1>
            <p className="font-body text-lg sm:text-xl text-black">
              Select a competition session to follow the action
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
      {/* Session Header */}
      {session && (
        <div className="bg-white border-b border-black sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h1 className="font-heading text-3xl sm:text-4xl font-black text-black mb-2 tracking-tight">
                  {session.name}
                </h1>
                <div className="flex items-center gap-3 text-sm font-ui text-black">
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
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-2 bg-black text-white font-heading text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  {session.current_lift === 'snatch' ? 'Snatch' : 'C&J'}
                </span>
              </div>
            </div>
            {session.competition && (
              <p className="font-body text-xs text-gray-600">{session.competition.name}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-6 py-8 space-y-8 max-w-2xl mx-auto">
        {/* Timer Display */}
        <Timer 
          time={timer.timeRemaining} 
          isRunning={timer.isRunning}
          mode={timer.mode}
        />

        {/* Referee Decision - Shows when result is finalized */}
        {currentAttempt?.result && currentAttempt.result !== 'pending' && (
          <RefereeDecisionCompact attempt={currentAttempt} />
        )}

        {/* Current Attempt */}
        <LiveAttemptCard attempt={currentAttempt} />

        {/* Upcoming Athletes */}
        <UpcomingAthletes athletes={liftingOrder.slice(0, 5)} />

        {/* Mobile Change Session Button */}
        <button
          onClick={() => setSessionId(null)}
          className="w-full py-4 bg-white border-2 border-black text-black font-ui font-bold hover:bg-black hover:text-white transition-colors"
        >
          Change Session
        </button>
      </div>

      {/* Notification Display */}
      <NotificationDisplay socket={socketService.socket} />
    </div>
  );
}
