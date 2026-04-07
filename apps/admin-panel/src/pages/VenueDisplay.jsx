import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socketService from '../services/socket';
import api from '../services/api';

export default function VenueDisplay() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Time state
  const [timerStatus, setTimerStatus] = useState('stopped');
  const [timerValue, setTimerValue] = useState(60);

  // "Result Flash Mode" state
  const [refereeDecision, setRefereeDecision] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    
    const fetchSessionData = async () => {
      try {
        const response = await api.get(`/sessions/${sessionId}`);
        setSession(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load session:', err);
        setError('Failed to load session data');
        setLoading(false);
      }
    };

    fetchSessionData();
    socketService.connect();
    
    if (sessionId) {
      socketService.joinSession(sessionId);
    }

    const unsubs = [
      socketService.onTimerUpdate((data) => {
        setTimerValue(data.timeRemaining);
        setTimerStatus(data.status);
      }),
      socketService.onAttemptUpdate((data) => {
        if (data.activeAttempt) {
          setCurrentAttempt(data.activeAttempt);
        }
      }),
      socketService.onRefereeDecision((data) => {
        setRefereeDecision(data);
        // Clear decision banner after 5 seconds
        setTimeout(() => setRefereeDecision(null), 5000);
      }),
    ];

    return () => {
      unsubs.forEach(unsub => { if (unsub) unsub(); });
      if (sessionId) {
        socketService.leaveSession(sessionId);
      }
      socketService.disconnect();
    };
  }, [sessionId]);

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white text-4xl font-heading">Loading Display...</div>;
  }

  if (error || !session) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-4xl font-heading">{error || 'Session not found'}</div>;
  }

  // Render Result Flash if a decision was just made
  if (refereeDecision) {
    const isGoodLift = refereeDecision.decision === 'good';
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center text-white font-heading transition-colors duration-300 ${isGoodLift ? 'bg-green-600' : 'bg-red-600'}`}>
        <h1 className="text-[15rem] font-bold uppercase tracking-tighter shadow-sm">
          {isGoodLift ? 'GOOD LIFT' : 'NO LIFT'}
        </h1>
      </div>
    );
  }

  // Attempt Mode (Default)
  return (
    <div className="min-h-screen w-full bg-black text-white font-ui font-bold p-8 flex flex-col">
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 p-8 rounded-3xl mb-8 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-zinc-400 text-2xl uppercase tracking-widest mb-2 font-heading">Current Session</span>
          <span className="text-5xl font-heading tracking-tight">{session.name || 'Men 89kg Group A'}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-zinc-400 text-2xl uppercase tracking-widest mb-2 font-heading">Weight Class</span>
          <span className="text-5xl text-blue-400 font-heading tracking-tight">{session.weightClass || '89kg'}</span>
        </div>
      </div>
      
      <div className="flex-1 grid grid-cols-12 gap-8">
        {/* Lifter Info Area */}
        <div className="col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl p-12 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-bl-full opacity-10 drop-shadow-[0_0_100px_rgba(37,99,235,0.5)]"></div>
          
          <span className="text-zinc-400 text-3xl uppercase tracking-widest mb-4 font-heading z-10">Current Lifter</span>
          
          {currentAttempt ? (
            <div className="flex-1 flex flex-col justify-center z-10">
              <h1 className="text-[9rem] leading-none mb-6 tracking-tighter text-white drop-shadow-md">
                {currentAttempt.athlete?.firstName} <span className="text-blue-500">{currentAttempt.athlete?.lastName}</span>
              </h1>
              
              <div className="flex items-center gap-8 mt-4">
                <span className="bg-zinc-800 text-zinc-300 text-4xl px-8 py-4 rounded-xl border border-zinc-700">
                  {currentAttempt.athlete?.team || 'Unattached'}
                </span>
                <span className="bg-blue-900/40 text-blue-300 text-4xl px-8 py-4 rounded-xl border border-blue-800/50">
                  Attempt {currentAttempt.attemptNumber}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-6xl text-zinc-600 italic font-heading z-10">
              Waiting for lifter...
            </div>
          )}
        </div>

        {/* Weight & Timer Area */}
        <div className="col-span-4 flex flex-col gap-8">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
            <span className="text-zinc-400 text-3xl uppercase tracking-widest mb-6 font-heading z-10">Weight</span>
            <div className="flex items-baseline text-[12rem] leading-none text-red-500 tracking-tighter drop-shadow-md z-10">
              {currentAttempt?.weight || '0'}
              <span className="text-6xl text-red-600/50 ml-4 font-normal">kg</span>
            </div>
          </div>
          
          <div className={`h-[35%] rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl border transition-colors duration-500 ${
            timerValue <= 10 && timerStatus === 'running' 
              ? 'bg-red-900/30 border-red-500 text-red-500 animate-pulse' 
              : 'bg-zinc-900 border-zinc-800 text-yellow-400'
          }`}>
            <span className={`text-2xl uppercase tracking-widest mb-2 font-heading ${
              timerValue <= 10 && timerStatus === 'running' ? 'text-red-400' : 'text-zinc-400'
            }`}>
              Time Remaining
            </span>
            <div className="text-[10rem] leading-none font-mono tracking-tighter drop-shadow-md">
              {Math.floor(timerValue / 60)}:{(timerValue % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
