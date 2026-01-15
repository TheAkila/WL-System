import { motion } from 'framer-motion';

export default function AttemptResult({ attempt }) {
  if (!attempt) return null;

  const isGood = attempt.result === 'good';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`p-12 h-96 flex items-center justify-center border-4 border-black ${
        isGood ? 'bg-white' : 'bg-white'
      }`}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="font-heading text-9xl font-black mb-6"
        >
          {isGood ? '✓' : '✗'}
        </motion.div>
        <div className="font-heading text-6xl font-black text-black">
          {isGood ? 'GOOD LIFT!' : 'NO LIFT'}
        </div>
        <div className="font-heading text-4xl mt-6 font-black text-black">
          {attempt.athlete?.name} • {attempt.weight} kg
        </div>
      </div>
    </motion.div>
  );
}
