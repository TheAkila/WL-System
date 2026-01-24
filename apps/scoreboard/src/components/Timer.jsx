import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

export default function Timer({ time, isRunning = false, mode = 'attempt' }) {
  const getColor = () => {
    if (time <= 10) return 'text-red-600';
    if (time <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBgColor = () => {
    if (time <= 10) return 'bg-red-50 border-red-600';
    if (time <= 30) return 'bg-yellow-50 border-yellow-600';
    return 'bg-green-50 border-green-600';
  };

  const getBorderColor = () => {
    if (time <= 10) return 'border-red-600';
    if (time <= 30) return 'border-yellow-600';
    return 'border-green-600';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'attempt':
        return 'ATTEMPT';
      case 'break':
        return 'BREAK';
      case 'jury':
        return 'JURY';
      default:
        return 'TIME';
    }
  };

  return (
    <div className={`${getBgColor()} border-4 ${getBorderColor()} p-4 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        {/* Timer Icon and Label */}
        <div className="flex items-center gap-2">
          <Clock className={`${getColor()} w-6 h-6`} />
          <span className="font-heading text-lg font-black text-black tracking-wider">
            {getModeLabel()}
          </span>
          {isRunning && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2 h-2 bg-red-600 rounded-full"
            />
          )}
        </div>

        {/* Timer Display */}
        <motion.div
          animate={{ 
            scale: time <= 10 && isRunning ? [1, 1.1, 1] : 1 
          }}
          transition={{ repeat: time <= 10 && isRunning ? Infinity : 0, duration: 0.8 }}
          className={`font-heading text-4xl font-black ${getColor()}`}
        >
          {formatTime(time)}
        </motion.div>

        {/* Warning Indicator */}
        {time <= 30 && isRunning && (
          <AlertTriangle 
            className={time <= 10 ? 'text-red-600 animate-bounce' : 'text-yellow-600'} 
            size={24} 
          />
        )}
      </div>

      {/* Expired State */}
      {time === 0 && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="mt-2 text-center text-sm font-black text-red-600 uppercase"
        >
          TIME EXPIRED
        </motion.div>
      )}
    </div>
  );
}
