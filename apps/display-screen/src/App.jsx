import { useState, useEffect } from 'react';
import { useRealtimeUpdates } from './hooks/useRealtimeUpdates';
import api from './services/api';
import socketService from './services/socket';

function App() {
  const [sessionId, setSessionId] = useState(null);
  const [session, setSession] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const { currentAttempt, leaderboard, session: liveSession, timer } = useRealtimeUpdates(sessionId);

  // Update session when live session changes from Socket.IO
  useEffect(() => {
    if (liveSession) {
      console.log('Live session updated:', liveSession);
      setSession(liveSession);
    }
  }, [liveSession]);

  // Connect to Socket.IO and listen for display screen activation
  useEffect(() => {
    // Connect socket on mount
    const socket = socketService.connect();
    console.log('Display screen socket connecting...');

    // Monitor connection status
    socket.on('connect', () => {
      setSocketConnected(true);
      console.log('✅ Socket connected with ID:', socket.id);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
      console.log('❌ Socket disconnected');
    });

    // Test: Listen to ALL events
    socket.onAny((eventName, ...args) => {
      console.log('📨 Received event:', eventName, args);
    });

    // Listen for display screen activation from admin panel
    const handleDisplaySwitch = async (data) => {
      console.log('🔴 Display screen activated for session:', data.sessionId);
      setSessionId(data.sessionId);
      
      // Fetch session details
      try {
        const sessionResponse = await api.get(`/sessions/${data.sessionId}`);
        if (sessionResponse.data.data) {
          setSession(sessionResponse.data.data);
          console.log('✅ Session loaded:', sessionResponse.data.data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch session:', error);
      }
    };

    socket.on('display:switch', handleDisplaySwitch);
    console.log('👂 Listening for display:switch events');

    return () => {
      socket.off('display:switch', handleDisplaySwitch);
      socket.offAny();
      socketService.disconnect();
    };
  }, []);

  // Get session from URL query parameter on initial load
  useEffect(() => {
    const fetchSession = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlSessionId = params.get('session');

      if (urlSessionId) {
        setSessionId(urlSessionId);
        // Fetch session details
        try {
          const response = await api.get(`/sessions/${urlSessionId}`);
          if (response.data.data) setSession(response.data.data);
        } catch (error) {
          console.error('Failed to fetch session:', error);
        }
      }
    };

    fetchSession();
  }, []);

  if (!sessionId || !session) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-pulse">🏋️</div>
          <h1 className="text-6xl font-bold text-white mb-4">Lifting Live Arena</h1>
          <p className="text-2xl text-gray-400">Waiting for active session...</p>
          <p className="text-lg text-gray-500 mt-4">Listening for activation from Technical Panel</p>
          <div className="mt-8 inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm">
            ● {socketConnected ? 'Connected' : 'Connecting...'}
          </div>
          {/* Debug Info */}
          <div className="mt-8 bg-gray-800 text-white p-4 rounded-lg text-left max-w-md mx-auto text-xs">
            <div>SessionID: {sessionId || 'null'}</div>
            <div>Session: {session ? 'loaded' : 'null'}</div>
            <div>Socket: {socketConnected ? 'connected' : 'disconnected'}</div>
          </div>
          {/* Test Button */}
          <button
            onClick={async () => {
              console.log('Test button clicked');
              try {
                const response = await api.get('/sessions');
                const sessions = response.data.data || [];
                console.log('Available sessions:', sessions);
                if (sessions.length > 0) {
                  console.log('Setting first session:', sessions[0].id);
                  setSessionId(sessions[0].id);
                  setSession(sessions[0]);
                }
              } catch (error) {
                console.error('Test failed:', error);
              }
            }}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg"
          >
            Test: Load First Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex flex-col">
      {/* HEADER SECTION - Competition Info */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-4 border-yellow-500 py-4 px-8">
        <div className="flex items-center justify-between text-white">
          <div className="text-2xl font-bold">
            {session.competition?.name || session.competition_name || 'WEIGHTLIFTING COMPETITION'}
          </div>
          <div className="flex items-center gap-8 text-xl font-semibold">
            <span>{session.gender === 'male' ? 'MEN' : 'WOMEN'} • {session.weight_category}kg</span>
            <span className="text-yellow-400">
              {currentAttempt?.lift_type === 'snatch' ? 'SNATCH' : 'CLEAN & JERK'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN LIFTER SECTION - Center Focus */}
      <div className="flex-1 flex items-center justify-center px-12 py-8">
        {currentAttempt && currentAttempt.result === 'pending' ? (
          <div className="w-full h-full flex items-center">
            {/* LEFT: Athlete Info */}
            <div className="flex-1 text-left">
              <div className="text-white text-7xl font-black leading-tight mb-6">
                {currentAttempt.athlete?.name || 'ATHLETE'}
              </div>
              <div className="text-yellow-400 text-4xl font-bold mb-4">
                {currentAttempt.athlete?.team?.country || currentAttempt.athlete?.team || 'TEAM'}
              </div>
              <div className="text-white text-3xl font-semibold">
                BIB #{currentAttempt.athlete?.start_number || '—'}
              </div>
            </div>

            {/* CENTER: Weight Display */}
            <div className="flex-shrink-0 mx-16">
              <div className="bg-yellow-500 border-8 border-white px-20 py-12 shadow-2xl">
                <div className="text-black text-9xl font-black leading-none text-center">
                  {currentAttempt.weight}
                </div>
                <div className="text-black text-5xl font-black text-center mt-4">
                  KG
                </div>
              </div>
            </div>

            {/* RIGHT: Attempt Info */}
            <div className="flex-1 text-right">
              <div className="text-white text-5xl font-black mb-6">
                ATTEMPT
              </div>
              <div className="text-yellow-400 text-9xl font-black leading-none">
                {currentAttempt.attempt_number}
              </div>
              <div className="text-white text-4xl font-semibold mt-4">
                OF 3
              </div>
            </div>
          </div>
        ) : currentAttempt && currentAttempt.result !== 'pending' ? (
          /* RESULT DISPLAY */
          <div className="text-center">
            <div className={`text-9xl font-black mb-8 ${
              currentAttempt.result === 'good' ? 'text-green-500' : 'text-red-500'
            }`}>
              {currentAttempt.result === 'good' ? '✓ GOOD LIFT' : '✗ NO LIFT'}
            </div>
            <div className="text-white text-6xl font-bold">
              {currentAttempt.athlete?.name}
            </div>
            <div className="text-yellow-400 text-5xl font-bold mt-4">
              {currentAttempt.weight} KG
            </div>
          </div>
        ) : (
          /* WAITING STATE */
          <div className="text-center">
            <div className="text-white text-7xl font-black mb-8">
              PREPARING NEXT ATTEMPT
            </div>
            <div className="text-gray-500 text-4xl font-semibold">
              Stand by...
            </div>
          </div>
        )}
      </div>

      {/* TIMER & STATUS SECTION - Bottom */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-t-4 border-yellow-500 py-6 px-8">
        <div className="flex items-center justify-between">
          {/* STATUS */}
          <div className={`text-4xl font-black ${
            currentAttempt?.result === 'pending' ? 'text-green-400' :
            currentAttempt?.result === 'good' ? 'text-green-500' :
            currentAttempt?.result === 'no-lift' ? 'text-red-500' :
            'text-gray-500'
          }`}>
            {currentAttempt?.result === 'pending' ? '● ON PLATFORM' :
             currentAttempt?.result === 'good' ? '✓ GOOD LIFT' :
             currentAttempt?.result === 'no-lift' ? '✗ NO LIFT' :
             'WAITING'}
          </div>

          {/* TIMER */}
          <div className={`text-8xl font-black tabular-nums ${
            timer.timeRemaining <= 10 ? 'text-red-500' :
            timer.timeRemaining <= 30 ? 'text-yellow-500' :
            'text-white'
          }`}>
            {Math.floor(timer.timeRemaining / 60)}:{String(timer.timeRemaining % 60).padStart(2, '0')}
          </div>

          {/* LIFT TYPE */}
          <div className="text-4xl font-black text-yellow-400">
            {currentAttempt?.lift_type === 'snatch' ? 'SNATCH' : 'CLEAN & JERK'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
