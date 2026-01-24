import { useEffect, useState } from 'react';
import socketService from '../services/socket';
import api from '../services/api';

export const useRealtimeUpdates = (sessionId) => {
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [session, setSession] = useState(null);
  const [timer, setTimer] = useState({ 
    timeRemaining: 60, 
    isRunning: false, 
    mode: 'attempt',
    autoStarted: false 
  });

  // Fetch initial current attempt when sessionId changes
  useEffect(() => {
    if (!sessionId) return;

    const fetchInitialData = async () => {
      try {
        // Fetch current attempt
        const attemptResponse = await api.get(`/technical/sessions/${sessionId}/current-attempt`);
        if (attemptResponse.data.data) {
          console.log('📋 Initial current attempt loaded:', attemptResponse.data.data);
          setCurrentAttempt(attemptResponse.data.data);
        }

        // Fetch leaderboard
        const leaderboardResponse = await api.get(`/technical/sessions/${sessionId}/leaderboard`);
        if (leaderboardResponse.data.data) {
          console.log('🏆 Initial leaderboard loaded:', leaderboardResponse.data.data);
          setLeaderboard(leaderboardResponse.data.data);
        }
      } catch (error) {
        console.log('Failed to fetch initial data:', error.message);
      }
    };

    fetchInitialData();
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) {
      console.log('⚠️ useRealtimeUpdates: No sessionId provided');
      return;
    }

    console.log('🔌 useRealtimeUpdates: Setting up for session:', sessionId);

    // Connect to Socket.IO
    socketService.connect();
    socketService.joinSession(sessionId);
    console.log('✅ Joined session room:', sessionId);

    // Listen for attempt updates
    socketService.on('attempt:created', (attempt) => {
      console.log('📥 New attempt created:', attempt);
      setCurrentAttempt(attempt);
    });

    socketService.on('attempt:validated', (attempt) => {
      console.log('📥 Attempt validated:', attempt);
      setCurrentAttempt(attempt);
      
      // Clear after showing result for 5 seconds
      setTimeout(() => {
        setCurrentAttempt(null);
      }, 5000);
    });

    // Listen for leaderboard updates
    socketService.on('leaderboard:updated', (updatedLeaderboard) => {
      console.log('📥 Leaderboard updated:', updatedLeaderboard);
      setLeaderboard(updatedLeaderboard);
    });

    // Listen for timer updates
    socketService.on('timer:tick', (timerData) => {
      setTimer(prev => ({ 
        ...prev,
        timeRemaining: timerData.timeRemaining, 
        isRunning: timerData.isRunning,
        mode: timerData.mode || prev.mode,
        autoStarted: false // Clear auto-start flag on tick
      }));
    });

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
        mode: timerData.mode || prev.mode,
        autoStarted: false 
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

    // Listen for timer warnings
    socketService.on('timer:warning', (data) => {
      console.log('Timer warning:', data.warningType);
      // Warning visual handled by Timer component based on time
    });

    // Listen for auto-start timer
    socketService.on('timer:autoStarted', (data) => {
      console.log('Timer auto-started:', data);
      setTimer(prev => ({
        ...prev,
        autoStarted: true,
        mode: 'attempt'
      }));
      // Clear auto-start indicator after 5 seconds
      setTimeout(() => {
        setTimer(prev => ({ ...prev, autoStarted: false }));
      }, 5000);
    });

    // Listen for session updates
    socketService.on('session:updated', (updatedSession) => {
      console.log('Session updated:', updatedSession);
      setSession(updatedSession);
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
    timer,
  };
};
