export default function LiveAttemptCard({ attempt }) {
  if (!attempt || attempt.result !== 'pending') {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-3 animate-pulse">⏳</div>
        <p className="text-gray-600 font-medium">Waiting for next attempt...</p>
      </div>
    );
  }

  const athlete = attempt.athlete;
  const liftType = attempt.lift_type === 'snatch' ? 'SNATCH' : 'CLEAN & JERK';

  return (
    <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-black bg-opacity-20 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold uppercase tracking-wider">On Platform</span>
        <span className="bg-white text-purple-900 px-3 py-1 rounded-full text-sm font-bold">
          Attempt {attempt.attempt_number}/3
        </span>
      </div>

      {/* Athlete Info */}
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-black mb-2">{athlete?.name || 'Athlete'}</h2>
          <div className="flex items-center justify-center gap-2 text-lg">
            <span>{athlete?.country || '🏳️'}</span>
            <span>•</span>
            <span>{athlete?.team || 'Team'}</span>
          </div>
        </div>

        {/* Weight Display */}
        <div className="bg-white text-purple-900 rounded-xl p-6 text-center">
          <div className="text-sm font-bold text-purple-600 mb-1">{liftType}</div>
          <div className="text-6xl font-black">{attempt.weight}</div>
          <div className="text-lg font-bold mt-1">KILOGRAMS</div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 text-center text-sm">
          <div>
            <div className="text-purple-200">Snatch</div>
            <div className="font-bold text-lg">{athlete?.best_snatch || 0}</div>
          </div>
          <div>
            <div className="text-purple-200">C&J</div>
            <div className="font-bold text-lg">{athlete?.best_clean_and_jerk || 0}</div>
          </div>
          <div>
            <div className="text-purple-200">Total</div>
            <div className="font-bold text-lg text-yellow-300">{athlete?.total || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
