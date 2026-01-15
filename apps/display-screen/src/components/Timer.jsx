import { motion } from 'framer-motion';

export default function Timer({ time }) {
  const getColor = () => {
    if (time <= 10) return 'text-black';
    if (time <= 30) return 'text-black';
    return 'text-black';
  };

  const getBgColor = () => {
    if (time <= 10) return 'bg-white border-4 border-black';
    if (time <= 30) return 'bg-white border-4 border-black';
    return 'bg-white border-4 border-black';
  };

  return (
    <div className={`${getBgColor()} p-8`}>
      <div className="text-center">
        <div className="font-heading text-2xl font-black text-black mb-4 tracking-widest">TIME REMAINING</div>
        <motion.div
          animate={{ scale: time <= 10 ? [1, 1.1, 1] : 1 }}
          transition={{ repeat: time <= 10 ? Infinity : 0, duration: 1 }}
          className={`font-heading text-9xl font-black ${getColor()}`}
        >
          {time}s
        </motion.div>
      </div>
    </div>
  );
}
