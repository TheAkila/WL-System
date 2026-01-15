export default function CurrentAttempt({ attempt }) {
  if (!attempt) {
    return (
      <div className="bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-800 p-12 text-center">
        <div className="text-slate-700 text-6xl mb-4">⏳</div>
        <p className="text-slate-400 text-lg font-ui">Waiting for next attempt...</p>
      </div>
    );
  }

  const getResultBadge = () => {
    if (attempt.result === 'good') {
      return <span className="px-4 py-2 bg-green-500 text-white rounded-xl text-lg font-ui font-bold shadow-lg">✓ GOOD LIFT</span>;
    }
    if (attempt.result === 'no-lift') {
      return <span className="px-4 py-2 bg-red-500 text-white rounded-xl text-lg font-ui font-bold shadow-lg">✗ NO LIFT</span>;
    }
    return <span className="px-4 py-2 bg-yellow-500 text-black rounded-xl text-lg font-ui font-bold shadow-lg">⏳ IN PROGRESS</span>;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-black rounded-2xl shadow-xl border-2 border-slate-800 p-6">
      <div className="text-center space-y-4">
        <div className="text-sm text-slate-500 font-ui font-bold uppercase tracking-wide">ON PLATFORM NOW</div>
        
        <div className="font-heading text-3xl md:text-4xl font-black text-white">
          {attempt.athlete?.name || 'Unknown Athlete'}
        </div>
        
        <div className="font-ui text-lg text-slate-400">
          {attempt.athlete?.country} • #{attempt.athlete?.startNumber}
        </div>

        <div className="flex items-center justify-center gap-6 py-6">
          <div className="text-center">
            <div className="text-sm text-slate-500 font-ui">Lift</div>
            <div className="text-xl font-bold text-white mt-1 font-heading">
              {attempt.liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-500 font-ui">Attempt</div>
            <div className="text-xl font-bold text-white mt-1 font-heading">{attempt.attemptNumber}/3</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-slate-500 font-ui">Weight</div>
            <div className="text-4xl font-bold text-white mt-1 font-heading">{attempt.weight} kg</div>
          </div>
        </div>

        <div className="pt-4">{getResultBadge()}</div>
      </div>
    </div>
  );
}
