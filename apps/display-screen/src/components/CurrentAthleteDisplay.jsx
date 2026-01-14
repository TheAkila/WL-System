export default function CurrentAthleteDisplay({ currentAttempt, session }) {
  if (!currentAttempt || currentAttempt.result !== 'pending') {
    return (
      <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-6 animate-pulse">⏳</div>
          <h2 className="text-5xl font-bold text-gray-400">Preparing Next Attempt</h2>
          <p className="text-2xl text-gray-500 mt-4">Stand by...</p>
        </div>
      </div>
    );
  }

  const athlete = currentAttempt.athlete;
  const liftType = currentAttempt.lift_type === 'snatch' ? 'SNATCH' : 'CLEAN & JERK';

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl border-4 border-yellow-500 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Athlete Info */}
        <div className="bg-black bg-opacity-40 p-8 border-b-4 border-yellow-500">
          <div className="flex items-center justify-between">
            {/* Left: Athlete Details */}
            <div className="flex-1">
              <div className="text-yellow-400 text-3xl font-bold mb-2 tracking-wider">
                ON PLATFORM
              </div>
              <h2 className="text-7xl font-black text-white mb-4 leading-tight">
                {athlete?.name || 'ATHLETE'}
              </h2>
              <div className="flex items-center gap-6 text-3xl text-gray-200">
                <span className="flex items-center gap-3">
                  <span className="text-4xl">{athlete?.country || '🏳️'}</span>
                  <span className="font-semibold">{athlete?.team || 'Team'}</span>
                </span>
                <span className="text-yellow-400">•</span>
                <span className="font-bold">Start #{athlete?.start_number || '-'}</span>
              </div>
            </div>

            {/* Right: Attempt Number Badge */}
            <div className="bg-yellow-500 text-black rounded-3xl px-8 py-6 shadow-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">ATTEMPT</div>
                <div className="text-7xl font-black">{currentAttempt.attempt_number}</div>
                <div className="text-xl font-bold mt-1">of 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Display - Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            {/* Lift Type */}
            <div className="text-4xl font-bold text-yellow-400 mb-6 tracking-widest">
              {liftType}
            </div>

            {/* Weight - MASSIVE */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-500 blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl px-16 py-12 shadow-2xl border-4 border-yellow-300">
                <div className="text-[12rem] font-black text-white leading-none">
                  {currentAttempt.weight}
                </div>
                <div className="text-6xl font-bold text-yellow-900 mt-4">
                  KILOGRAMS
                </div>
              </div>
            </div>

            {/* Current Best */}
            <div className="mt-12 bg-black bg-opacity-50 rounded-xl p-6 inline-block">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-xl text-gray-400 mb-2">Best Snatch</div>
                  <div className="text-4xl font-bold text-white">
                    {athlete?.best_snatch || 0} kg
                  </div>
                </div>
                <div>
                  <div className="text-xl text-gray-400 mb-2">Best C&J</div>
                  <div className="text-4xl font-bold text-white">
                    {athlete?.best_clean_and_jerk || 0} kg
                  </div>
                </div>
                <div>
                  <div className="text-xl text-gray-400 mb-2">Total</div>
                  <div className="text-4xl font-bold text-yellow-400">
                    {athlete?.total || 0} kg
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
