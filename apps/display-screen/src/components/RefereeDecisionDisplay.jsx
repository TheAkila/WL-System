import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Circle, Scale } from 'lucide-react';

export default function RefereeDecisionDisplay({ attempt }) {
  if (!attempt || attempt.result === 'pending') {
    return null;
  }

  const decisions = {
    left: attempt.referee_left,
    center: attempt.referee_center,
    right: attempt.referee_right
  };

  const getLightColor = (decision) => {
    if (decision === 'good') return 'bg-white border-4 border-gray-400 shadow-2xl shadow-white/80';
    if (decision === 'no-lift') return 'bg-red-600 shadow-2xl shadow-red-500/80';
    return 'bg-gray-400';
  };

  const goodCount = [decisions.left, decisions.center, decisions.right]
    .filter(d => d === 'good').length;

  const finalResult = goodCount >= 2 ? 'good' : 'no-lift';

  // Check if jury override is active
  const isJuryOverride = attempt.jury_override === true;
  const juryDecision = attempt.jury_decision;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-gray-900 to-black rounded-xl p-8 shadow-2xl"
    >
      {/* Jury Override Banner */}
      {isJuryOverride && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 p-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg"
        >
          <div className="flex items-center justify-center gap-3 text-white">
            <Scale size={32} />
            <div className="text-center">
              <div className="text-2xl font-black tracking-wider">⚖️ JURY OVERRIDE</div>
              <div className="text-sm mt-1 opacity-90">IWF Rule 3.3.5 Applied</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Result Banner */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className={`mb-8 p-6 rounded-lg text-center ${
          (isJuryOverride ? juryDecision : finalResult) === 'good' 
            ? 'bg-green-600 text-white' 
            : 'bg-red-600 text-white'
        }`}
      >
        <div className="flex items-center justify-center gap-3">
          {(isJuryOverride ? juryDecision : finalResult) === 'good' ? (
            <CheckCircle size={48} />
          ) : (
            <XCircle size={48} />
          )}
          <span className="text-5xl font-black tracking-wider">
            {(isJuryOverride ? juryDecision : finalResult) === 'good' ? 'GOOD LIFT' : 'NO LIFT'}
          </span>
        </div>
        {isJuryOverride && (
          <div className="mt-3 text-lg opacity-90">
            Jury Decision (Overrides Referee Decision)
          </div>
        )}
      </motion.div>

      {/* Referee Lights */}
      <div className="grid grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-gray-300 tracking-widest">LEFT</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`mx-auto w-32 h-32 rounded-full ${getLightColor(decisions.left)} flex items-center justify-center ${
              isJuryOverride ? 'opacity-50' : ''
            }`}
          >
            {decisions.left === 'good' && <CheckCircle size={64} className="text-gray-600" />}
            {decisions.left === 'no-lift' && <XCircle size={64} className="text-white" />}
          </motion.div>
        </div>

        {/* CENTER */}
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-gray-300 tracking-widest">CENTER</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`mx-auto w-32 h-32 rounded-full ${getLightColor(decisions.center)} flex items-center justify-center ${
              isJuryOverride ? 'opacity-50' : ''
            }`}
          >
            {decisions.center === 'good' && <CheckCircle size={64} className="text-gray-600" />}
            {decisions.center === 'no-lift' && <XCircle size={64} className="text-white" />}
          </motion.div>
        </div>

        {/* RIGHT */}
        <div className="text-center space-y-4">
          <div className="text-xl font-bold text-gray-300 tracking-widest">RIGHT</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className={`mx-auto w-32 h-32 rounded-full ${getLightColor(decisions.right)} flex items-center justify-center ${
              isJuryOverride ? 'opacity-50' : ''
            }`}
          >
            {decisions.right === 'good' && <CheckCircle size={64} className="text-gray-600" />}
            {decisions.right === 'no-lift' && <XCircle size={64} className="text-white" />}
          </motion.div>
        </div>
      </div>

      {/* Decision Count */}
      <div className="mt-8 text-center text-gray-400 text-lg">
        {isJuryOverride ? (
          <>
            <div className="text-amber-400 font-bold mb-2">Original Referee Decision (Overridden):</div>
            {goodCount} out of 3 referees: Good lift
            <div className="mt-3 text-sm text-gray-500 italic max-w-2xl mx-auto">
              Reason: {attempt.jury_reason}
            </div>
          </>
        ) : (
          `${goodCount} out of 3 referees: Good lift`
        )}
      </div>
    </motion.div>
  );
}
