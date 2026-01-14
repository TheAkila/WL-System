import { motion } from 'framer-motion';

export default function Timer({ time }) {
  const getColor = () => {
    if (time <= 10) return 'text-red-500';
    if (time <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-8">
      <div className="text-center">
        <div className="text-3xl text-gray-400 mb-4">TIME REMAINING</div>
        <motion.div
          animate={{ scale: time <= 10 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: time <= 10 ? Infinity : 0, duration: 1 }}
          className={`text-9xl font-bold ${getColor()}`}
        >
          {time}s
        </motion.div>
      </div>
    </div>
  );
}
