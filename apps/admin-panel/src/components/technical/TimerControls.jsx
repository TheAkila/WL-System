import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import api from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

export default function TimerControls({ sessionId }) {
  const [timerState, setTimerState] = useState({
    timeRemaining: 60,
    isRunning: false,
    maxTime: 60,
    mode: 'attempt',
  });
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoStarted, setAutoStarted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial timer state
    fetchTimerState();

    // Listen for timer events
    socketService.on('timer:tick', handleTimerTick);
    socketService.on('timer:paused', handleTimerPaused);
    socketService.on('timer:reset', handleTimerReset);
    socketService.on('timer:expired', handleTimerExpired);
    socketService.on('timer:warning', handleTimerWarning);
    socketService.on('timer:autoStarted', handleTimerAutoStarted);

    return () => {
      socketService.off('timer:tick', handleTimerTick);
      socketService.off('timer:paused', handleTimerPaused);
      socketService.off('timer:reset', handleTimerReset);
      socketService.off('timer:expired', handleTimerExpired);
      socketService.off('timer:warning', handleTimerWarning);
      socketService.off('timer:autoStarted', handleTimerAutoStarted);
    };
  }, [sessionId]);

  const fetchTimerState = async () => {
    try {
      const response = await api.get(`/timer/${sessionId}`);
      setTimerState(response.data.data);
    } catch (error) {
      console.error('Failed to fetch timer state:', error);
    }
  };

  const handleTimerTick = (data) => {
    if (data.sessionId === sessionId) {
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: data.timeRemaining,
        isRunning: data.isRunning,
        mode: data.mode || prev.mode,
        maxTime: data.maxTime || prev.maxTime,
      }));
    }
  };

  const handleTimerPaused = (data) => {
    if (data.sessionId === sessionId) {
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: data.timeRemaining,
        isRunning: false,
        mode: data.mode || prev.mode,
      }));
      toast.success('Timer paused');
    }
  };

  const handleTimerReset = (data) => {
    if (data.sessionId === sessionId) {
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: data.timeRemaining,
        isRunning: false,
        maxTime: data.timeRemaining,
        mode: data.mode || 'attempt',
      }));
      toast.success('Timer reset');
    }
  };

  const handleTimerExpired = (data) => {
    if (data.sessionId === sessionId) {
      setTimerState((prev) => ({
        ...prev,
        timeRemaining: 0,
        isRunning: false,
      }));
      playSound();
      toast.error('⏰ Time expired!', {
        duration: 5000,
        icon: '🔔',
      });
    }
  };

  const handleTimerWarning = (data) => {
    if (data.sessionId === sessionId) {
      playSound();
      const icon = data.timeRemaining === 30 ? '⚠️' : '🚨';
      toast.warning(`${icon} ${data.message}`, {
        duration: 3000,
      });
    }
  };

  const handleTimerAutoStarted = (data) => {
    if (data.sessionId === sessionId) {
      setAutoStarted(true);
      // Clear auto-start indicator after 5 seconds
      setTimeout(() => setAutoStarted(false), 5000);
    }
  };

  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch((err) => console.log('Audio play failed:', err));
    }
  };

  const handleStart = async () => {
    try {
      await api.post(`/timer/${sessionId}/start`, {
        duration: selectedDuration,
        mode: selectedDuration === 600 ? 'jury' : 'attempt',
      });
      toast.success('Timer started');
    } catch (error) {
      toast.error('Failed to start timer');
      console.error(error);
    }
  };

  const handlePause = async () => {
    try {
      await api.post(`/timer/${sessionId}/pause`);
    } catch (error) {
      toast.error('Failed to pause timer');
      console.error(error);
    }
  };

  const handleReset = async () => {
    try {
      await api.post(`/timer/${sessionId}/reset`, {
        duration: selectedDuration,
        mode: selectedDuration === 600 ? 'jury' : 'attempt',
      });
    } catch (error) {
      toast.error('Failed to reset timer');
      console.error(error);
    }
  };

  const handlePreset = async (presetName, duration) => {
    try {
      setSelectedDuration(duration);
      await api.post(`/timer/${sessionId}/preset`, {
        preset: presetName,
      });
      toast.success(`Timer set to ${presetName.replace(/_/g, ' ').toLowerCase()}`);
    } catch (error) {
      toast.error('Failed to set preset');
      console.error(error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timerState.timeRemaining <= 10) return 'text-red-600 dark:text-red-400 animate-pulse';
    if (timerState.timeRemaining <= 30) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getProgressColor = () => {
    if (timerState.timeRemaining <= 10) return 'bg-red-500 animate-pulse';
    if (timerState.timeRemaining <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBorderColor = () => {
    if (timerState.timeRemaining <= 10) return 'border-red-500 shadow-lg shadow-red-500/50';
    if (timerState.timeRemaining <= 30) return 'border-yellow-500 shadow-lg shadow-yellow-500/50';
    return 'border-blue-500';
  };

  const progressPercentage = (timerState.timeRemaining / timerState.maxTime) * 100;
  const showWarning = timerState.timeRemaining <= 30 && timerState.isRunning;

  return (
    <div className={`card p-6 border-2 transition-all ${getBorderColor()}`}>
      {/* Hidden audio element for beep sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTgIG2i77OifTRAMUKfj8LNlHAU2jdf..." />
      </audio>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="text-blue-600" size={24} />
          <div>
            <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              Competition Timer
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Mode: {timerState.mode?.toUpperCase() || 'ATTEMPT'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          title={soundEnabled ? 'Disable sound' : 'Enable sound'}
        >
          {soundEnabled ? (
            <Volume2 className="text-blue-600" size={20} />
          ) : (
            <VolumeX className="text-slate-400" size={20} />
          )}
        </button>
      </div>

      {/* Auto-Start Indicator */}
      {autoStarted && (
        <div className="mb-4 p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 flex items-center gap-2 animate-pulse">
          <Play className="text-blue-600" size={20} />
          <span className="font-medium text-blue-800 dark:text-blue-300">
            ⚡ Timer auto-started on attempt declaration
          </span>
        </div>
      )}

      {/* Warning Banner */}
      {showWarning && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          timerState.timeRemaining <= 10 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 animate-pulse' 
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
        }`}>
          <AlertTriangle size={20} />
          <span className="font-medium">
            {timerState.timeRemaining <= 10 ? 'FINAL 10 SECONDS!' : 'Warning: 30 seconds remaining'}
          </span>
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className={`text-7xl font-heading font-black mb-2 ${getTimerColor()}`}>
          {formatTime(timerState.timeRemaining)}
        </div>
        <div className="text-sm text-slate-500 dark:text-zinc-400">
          {timerState.isRunning ? '⏱️ Running' : '⏸️ Stopped'}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-zinc-700 rounded-full h-4 mt-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
          Quick Presets (IWF Standard)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handlePreset('FIRST_ATTEMPT', 60)}
            className="py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg font-medium transition-colors text-sm"
          >
            1st Attempt (1:00)
          </button>
          <button
            onClick={() => handlePreset('SUBSEQUENT_ATTEMPT', 120)}
            className="py-2 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-lg font-medium transition-colors text-sm"
          >
            2nd/3rd (2:00)
          </button>
          <button
            onClick={() => handlePreset('JURY_DECISION', 600)}
            className="py-2 px-3 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-lg font-medium transition-colors text-sm"
          >
            Jury (10:00)
          </button>
          <button
            onClick={() => handlePreset('BREAK', 600)}
            className="py-2 px-3 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 rounded-lg font-medium transition-colors text-sm"
          >
            Break (10:00)
          </button>
        </div>
      </div>

      {/* Manual Duration Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
          Manual Duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedDuration(30)}
            className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
              selectedDuration === 30
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            0:30
          </button>
          <button
            onClick={() => setSelectedDuration(60)}
            className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
              selectedDuration === 60
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            1:00
          </button>
          <button
            onClick={() => setSelectedDuration(120)}
            className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
              selectedDuration === 120
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            2:00
          </button>
          <button
            onClick={() => setSelectedDuration(180)}
            className={`py-2 px-3 rounded-lg font-medium transition-colors text-sm ${
              selectedDuration === 180
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            3:00
          </button>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={timerState.isRunning ? handlePause : handleStart}
          disabled={!sessionId}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
            timerState.isRunning
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {timerState.isRunning ? (
            <>
              <Pause size={20} />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play size={20} />
              <span>Start</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          disabled={!sessionId}
          className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw size={20} />
          <span>Reset</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Timer Rules:</strong> Athletes have 60 seconds for first attempt, 2 minutes for
          subsequent attempts. Clock starts when name is called.
        </p>
      </div>
    </div>
  );
}
