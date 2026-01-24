import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export default function CompetitionTimer({ isRunning, onStart, onPause, onReset, duration = 60, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    setTimerActive(isRunning);
  }, [isRunning]);

  useEffect(() => {
    let interval = null;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setTimerActive(false);
            onPause?.();
            // Play alert sound
            playAlert();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (!timerActive && timeLeft !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, onPause]);

  const playAlert = () => {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const handleStart = () => {
    setTimerActive(true);
    onStart?.();
  };

  const handlePause = () => {
    setTimerActive(false);
    onPause?.();
  };

  const handleReset = () => {
    setTimerActive(false);
    setTimeLeft(duration);
    onReset?.();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    if (timeLeft === 0) return 'text-red-600 dark:text-red-400';
    if (timeLeft <= 10) return 'text-red-600 dark:text-red-400 animate-pulse';
    if (timeLeft <= 30) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  // Compact version for nav bar
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono font-bold ${getTimerColor()}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
        {!timerActive ? (
          <button
            onClick={handleStart}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700"
            disabled={timeLeft === 0}
          >
            <Play size={14} className="text-green-600" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700"
          >
            <Pause size={14} className="text-orange-600" />
          </button>
        )}
        <button
          onClick={handleReset}
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-zinc-700"
        >
          <RotateCcw size={14} className="text-slate-600 dark:text-zinc-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 border-2 border-slate-300 dark:border-zinc-700 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-slate-600 dark:text-zinc-400" />
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
            Competition Timer
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-zinc-500">
          {duration === 60 ? '1 minute' : '2 minutes'}
        </span>
      </div>

      {/* Timer Display */}
      <div className={`text-6xl font-black text-center mb-4 tabular-nums ${getTimerColor()}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {!timerActive ? (
          <button
            onClick={handleStart}
            className="btn btn-success flex items-center gap-2 px-4 py-2"
            disabled={timeLeft === 0}
          >
            <Play size={18} />
            Start
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn btn-warning flex items-center gap-2 px-4 py-2"
          >
            <Pause size={18} />
            Pause
          </button>
        )}
        <button
          onClick={handleReset}
          className="btn btn-secondary flex items-center gap-2 px-4 py-2"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft === 0 ? 'bg-red-600' :
            timeLeft <= 10 ? 'bg-red-500' :
            timeLeft <= 30 ? 'bg-orange-500' :
            'bg-green-500'
          }`}
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
