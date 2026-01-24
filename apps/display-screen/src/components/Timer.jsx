import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export default function Timer({ time, isRunning = false, mode = 'attempt', autoStarted = false }) {
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState(null);

  // Update warning state based on time
  useEffect(() => {
    if (time <= 10 && isRunning) {
      setShowWarning(true);
      setWarningType('critical');
    } else if (time <= 30 && isRunning) {
      setShowWarning(true);
      setWarningType('warning');
    } else {
      setShowWarning(false);
      setWarningType(null);
    }
  }, [time, isRunning]);

  const getColor = () => {
    if (time <= 10) return 'text-red-600 dark:text-red-500';
    if (time <= 30) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-green-600 dark:text-green-500';
  };

  const getBgColor = () => {
    if (time <= 10) return 'bg-red-100 dark:bg-red-950/50 border-4 border-red-600 shadow-2xl shadow-red-600/50';
    if (time <= 30) return 'bg-yellow-100 dark:bg-yellow-950/50 border-4 border-yellow-600 shadow-2xl shadow-yellow-600/50';
    return 'bg-green-100 dark:bg-green-950/50 border-4 border-green-600 shadow-lg shadow-green-600/30';
  };

  const getWarningBg = () => {
    if (time <= 10) return 'bg-red-600 text-white';
    if (time <= 30) return 'bg-yellow-600 text-white';
    return 'bg-blue-600 text-white';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'attempt':
        return 'ATTEMPT TIME';
      case 'break':
        return 'BREAK TIME';
      case 'jury':
        return 'JURY DECISION';
      default:
        return 'TIME REMAINING';
    }
  };

  return (
    <div className={`${getBgColor()} rounded-xl p-8 transition-all duration-300 relative overflow-hidden`}>
      {/* Auto-Start Indicator */}
      {autoStarted && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm shadow-lg"
        >
          <Bell size={16} className="animate-pulse" />
          <span>AUTO-STARTED</span>
        </motion.div>
      )}

      {/* Warning Banner */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            scale: warningType === 'critical' ? [1, 1.02, 1] : 1 
          }}
          transition={{ 
            repeat: warningType === 'critical' ? Infinity : 0, 
            duration: 0.5 
          }}
          className={`${getWarningBg()} p-3 mb-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg shadow-lg`}
        >
          <AlertTriangle size={24} className={warningType === 'critical' ? 'animate-bounce' : ''} />
          <span>
            {warningType === 'critical' ? '⚠️ FINAL 10 SECONDS!' : '⏰ 30 SECONDS WARNING'}
          </span>
        </motion.div>
      )}

      <div className="text-center">
        {/* Mode/Timer Label */}
        <div className="font-heading text-2xl font-black text-gray-800 dark:text-gray-200 mb-4 tracking-widest flex items-center justify-center gap-3">
          <span>{getModeLabel()}</span>
          {isRunning && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-3 h-3 bg-red-600 rounded-full"
            />
          )}
        </div>

        {/* Timer Display */}
        <motion.div
          animate={{ 
            scale: time <= 10 && isRunning ? [1, 1.05, 1] : 1 
          }}
          transition={{ repeat: time <= 10 && isRunning ? Infinity : 0, duration: 0.8 }}
          className={`font-heading text-[10rem] leading-none font-black ${getColor()} drop-shadow-2xl`}
        >
          {formatTime(time)}
        </motion.div>

        {/* Timer Status */}
        {!isRunning && time > 0 && (
          <div className="mt-4 text-xl font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            ⏸️ PAUSED
          </div>
        )}
        
        {time === 0 && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="mt-4 text-3xl font-black text-red-600 uppercase tracking-wider"
          >
            🚨 TIME EXPIRED 🚨
          </motion.div>
        )}
      </div>
    </div>
  );
}
