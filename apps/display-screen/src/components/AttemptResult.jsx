import { motion } from 'framer-motion';

export default function AttemptResult({ attempt }) {
  if (!attempt) return null;

  const isGood = attempt.result === 'good';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`rounded-2xl p-12 h-96 flex items-center justify-center ${
        isGood ? 'bg-gradient-to-br from-green-600 to-green-400' : 'bg-gradient-to-br from-red-600 to-red-400'
      }`}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className="text-9xl font-bold mb-6"
        >
          {isGood ? '✓' : '✗'}
        </motion.div>
        <div className="text-6xl font-bold">
          {isGood ? 'GOOD LIFT!' : 'NO LIFT'}
        </div>
        <div className="text-4xl mt-6">
          {attempt.athlete?.name} • {attempt.weight} kg
        </div>
      </div>
    </motion.div>
  );
}
