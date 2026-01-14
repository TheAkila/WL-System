import { motion } from 'framer-motion';

export default function CurrentLifter({ lifter }) {
  if (!lifter) {
    return (
      <div className="bg-gray-800 rounded-2xl p-8 flex items-center justify-center h-96">
        <p className="text-3xl text-gray-500">Waiting for next lifter...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl p-12 h-96"
    >
      <div className="text-center space-y-6">
        <div className="text-6xl font-bold">{lifter.athlete?.name || 'Unknown'}</div>
        <div className="text-4xl text-blue-200">
          {lifter.athlete?.country || ''} • {lifter.athlete?.weightCategory || ''}
        </div>
        <div className="flex items-center justify-center gap-8 mt-8">
          <div className="text-center">
            <div className="text-2xl text-blue-200">Lift Type</div>
            <div className="text-5xl font-bold mt-2">
              {lifter.liftType === 'snatch' ? 'SNATCH' : 'CLEAN & JERK'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-blue-200">Attempt</div>
            <div className="text-5xl font-bold mt-2">{lifter.attemptNumber}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-blue-200">Weight</div>
            <div className="text-7xl font-bold mt-2 text-yellow-400">{lifter.weight} kg</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
