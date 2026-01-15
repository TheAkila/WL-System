import { motion } from 'framer-motion';

export default function CurrentLifter({ lifter }) {
  if (!lifter) {
    return (
      <div className="bg-white border-4 border-black p-8 flex items-center justify-center h-96">
        <p className="font-heading text-3xl font-black text-black">Waiting for next lifter...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-4 border-black p-12 h-96"
    >
      <div className="text-center space-y-6">
        <div className="font-heading text-6xl font-black text-black">{lifter.athlete?.name || 'Unknown'}</div>
        <div className="font-heading text-4xl text-black font-bold">
          {lifter.athlete?.country || ''} • {lifter.athlete?.weightCategory || ''}
        </div>
        <div className="flex items-center justify-center gap-8 mt-8">
          <div className="text-center border-r-4 border-black pr-8">
            <div className="font-heading text-2xl text-black font-bold mb-2">LIFT TYPE</div>
            <div className="font-heading text-5xl font-black mt-2 text-black">
              {lifter.liftType === 'snatch' ? 'SNATCH' : 'C&J'}
            </div>
          </div>
          <div className="text-center border-r-4 border-black pr-8">
            <div className="font-heading text-2xl text-black font-bold mb-2">ATTEMPT</div>
            <div className="font-heading text-5xl font-black mt-2 text-black">{lifter.attemptNumber}</div>
          </div>
          <div className="text-center">
            <div className="font-heading text-2xl text-black font-bold mb-2">WEIGHT</div>
            <div className="font-heading text-7xl font-black mt-2 text-black">{lifter.weight} kg</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
