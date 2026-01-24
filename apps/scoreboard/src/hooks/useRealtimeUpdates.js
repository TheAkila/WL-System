import { useEffect, useState } from 'react';
import socketService from '../services/socket';

export const useRealtimeUpdates = (sessionId) => {
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState({ 
    timeRemaining: 60, 
    isRunning: false, 
    mode: 'attempt' 
  });

  useEffect(() => {
    if (!sessionId) return;

    // Connect to Socket.IO
    socketService.connect();
    socketService.joinSession(sessionId);

    // Listen for attempt updates
    socketService.on('attempt:created', (attempt) => {
      console.log('New attempt created:', attempt);
      setCurrentAttempt(attempt);
    });

    socketService.on('attempt:validated', (attempt) => {
      console.log('Attempt validated:', attempt);
      setCurrentAttempt(attempt);
      
      // Clear after showing result for 3 seconds
      setTimeout(() => {
        setCurrentAttempt(null);
      }, 3000);
    });

    // Listen for leaderboard updates
    socketService.on('leaderboard:updated', (updatedLeaderboard) => {
      console.log('Leaderboard updated:', updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
    });

    // Listen for session updates
    socketService.on('session:updated', (updatedSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
    });

    // Listen for timer updates
    socketService.on('timer:tick', (timerData) => {
      setTimer(prev => ({ 
        ...prev,
        timeRemaining: timerData.timeRemaining, 
        isRunning: timerData.isRunning,
        mode: timerData.mode || prev.mode
      }));
    });

    timer,
    socketService.on('timer:paused', (timerData) => {
      setTimer(prev => ({ 
        ...prev,
        timeRemaining: timerData.timeRemaining, 
        isRunning: false,
        mode: timerData.mode || prev.mode 
      }));
    });

    socketService.on('timer:reset', (timerData) => {
      setTimer(prev => ({ 
        ...prev,
        timeRemaining: timerData.timeRemaining, 
        isRunning: false,
        mode: timerData.mode || prev.mode
      }));
    });

    socketService.on('timer:expired', (timerData) => {
      setTimer(prev => ({ 
        ...prev,
        timeRemaining: 0, 
        isRunning: false,
        mode: timerData?.mode || prev.mode 
      }));
    });

    socketService.on('timer:warning', (data) => {
      console.log('Timer warning:', data.warningType);
    });

    socketService.on('timer:autoStarted', (data) => {
      console.log('Timer auto-started:', data);
    });

    return () => {
      socketService.leaveSession(sessionId);
      socketService.disconnect();
    };
  }, [sessionId]);

  return {
    currentAttempt,
    leaderboard,
    session,
  };
};
