export default function CurrentAthleteDisplay({ currentAttempt, session }) {
  if (!currentAttempt || currentAttempt.result !== 'pending') {
    return (
      <div className="h-full bg-white border-4 border-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-9xl mb-6 animate-pulse">⏳</div>
          <h2 className="font-heading text-6xl font-black text-black">Preparing Next Attempt</h2>
          <p className="font-heading text-4xl text-gray-600 mt-4">Stand by...</p>
        </div>
      </div>
    );
  }

  const athlete = currentAttempt.athlete;
  const liftType = currentAttempt.lift_type === 'snatch' ? 'SNATCH' : 'CLEAN & JERK';

  return (
    <div className="h-full bg-white border-4 border-black overflow-hidden flex flex-col">
      <div className="h-full flex flex-col">
        {/* Athlete Info */}
        <div className="bg-white border-b-4 border-black p-8">
          <div className="flex items-center justify-between">
            {/* Left: Athlete Details */}
            <div className="flex-1">
              <div className="font-heading text-3xl font-black text-black mb-2 tracking-widest">
                ON PLATFORM
              </div>
              <h2 className="font-heading text-8xl font-black text-black mb-4 leading-tight">
                {athlete?.name || 'ATHLETE'}
              </h2>
              <div className="flex items-center gap-6 text-2xl text-black font-heading font-bold">
                <span className="flex items-center gap-3">
                  <span className="text-4xl">{athlete?.country || '🏳️'}</span>
                  <span>{athlete?.team || 'Team'}</span>
                </span>
                <span className="text-gray-400">•</span>
                <span>Start #{athlete?.start_number || '-'}</span>
              </div>
            </div>

            {/* Right: Attempt Number Badge */}
            <div className="bg-black text-white border-4 border-black px-8 py-6 shadow-brand ml-8">
              <div className="text-center">
                <div className="font-heading text-2xl font-black mb-1">ATTEMPT</div>
                <div className="font-heading text-8xl font-black">{currentAttempt.attempt_number}</div>
                <div className="font-heading text-2xl font-black mt-1">of 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Display - Hero Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            {/* Lift Type */}
            <div className="font-heading text-5xl font-black text-black mb-8 tracking-widest">
              {liftType}
            </div>

            {/* Weight - MASSIVE */}
            <div className="bg-black text-white border-4 border-black px-20 py-12 shadow-brand mb-12">
              <div className="font-heading text-9xl font-black leading-none">
                {currentAttempt.weight}
              </div>
              <div className="font-heading text-5xl font-black mt-4">
                KG
              </div>
            </div>

            {/* Current Best */}
            <div className="bg-white border-4 border-black p-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="font-heading text-xl font-black text-black mb-2">BEST SNATCH</div>
                  <div className="font-heading text-5xl font-black text-black">
                    {athlete?.best_snatch || 0}
                  </div>
                </div>
                <div>
                  <div className="font-heading text-xl font-black text-black mb-2">BEST C&J</div>
                  <div className="font-heading text-5xl font-black text-black">
                    {athlete?.best_clean_and_jerk || 0}
                  </div>
                </div>
                <div>
                  <div className="font-heading text-xl font-black text-black mb-2">TOTAL</div>
                  <div className="font-heading text-5xl font-black text-black">
                    {athlete?.total || 0}
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
