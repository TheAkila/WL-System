import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import CompetitionHeader from './components/CompetitionHeader';
import CurrentAthleteDisplay from './components/CurrentAthleteDisplay';
import ResultAnimation from './components/ResultAnimation';
import TopLeaderboard from './components/TopLeaderboard';
import api from './services/api';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const { currentAttempt, leaderboard, session: liveSession } = useRealtimeUpdates(sessionId);

  // Get session from URL query parameter or use first active session
  useEffect(() => {
    const fetchSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlSessionId = params.get('session');

      if (urlSessionId) {
        setSessionId(urlSessionId);
        // Fetch session details
        try {
          const response = await api.get(`/technical/sessions/active`);
          const foundSession = response.data.data.find(s => s.id === urlSessionId);
          if (foundSession) setSession(foundSession);
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      } else {
        // Auto-select first active session
        try {
          const response = await api.get('/technical/sessions/active');
          const activeSessions = response.data.data.filter(s => s.status === 'in-progress');
          if (activeSessions.length > 0) {
            setSessionId(activeSessions[0].id);
            setSession(activeSessions[0]);
          }
        } catch (error) {
          console.error('Failed to fetch sessions:', error);
        }
      }
    };

    fetchSession();
  }, []);

  // Update session when live session changes
  useEffect(() => {
    if (liveSession) {
      setSession(liveSession);
    }
  }, [liveSession]);

  if (!sessionId || !session) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6">🏋️</div>
          <h1 className="text-6xl font-bold text-white mb-4">Lifting Live Arena</h1>
          <p className="text-2xl text-gray-400">Waiting for active session...</p>
          <p className="text-lg text-gray-500 mt-4">Add ?session=SESSION_ID to URL or start a session</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      <div className="h-full flex flex-col p-8 gap-6">
        {/* Competition Header with Branding */}
        <CompetitionHeader session={session} />

        {/* Main Display Area */}
        <div className="flex-1 grid grid-cols-3 gap-6">
          {/* Left: Current Athlete (2/3 width) */}
          <div className="col-span-2">
            <CurrentAthleteDisplay 
              currentAttempt={currentAttempt} 
              session={session}
            />
          </div>

          {/* Right: Top 5 Leaderboard (1/3 width) */}
          <div>
            <TopLeaderboard leaderboard={leaderboard?.slice(0, 5) || []} />
          </div>
        </div>

        {/* Result Animation Overlay */}
        {currentAttempt?.result && currentAttempt.result !== 'pending' && (
          <ResultAnimation attempt={currentAttempt} />
        )}
      </div>
    </div>
  );
}

export default App;
