export default function CompetitionHeader({ session }) {
  if (!session) return null;

  const competition = session.competition;

  return (
    <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 rounded-2xl p-6 shadow-2xl border-2 border-blue-700">
      <div className="flex items-center justify-between">
        {/* Competition Name */}
        <div className="flex-1">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            {competition?.name || 'Weightlifting Competition'}
          </h1>
          <div className="flex items-center gap-4 text-xl text-blue-200">
            <span className="font-semibold">{session.name}</span>
            <span className="text-blue-400">•</span>
            <span>
              {session.gender === 'male' ? '🚹 Men' : '🚺 Women'} {session.weight_category}kg
            </span>
            <span className="text-blue-400">•</span>
            <span className="uppercase font-bold text-yellow-400">
              {session.current_lift === 'snatch' ? 'SNATCH' : 'CLEAN & JERK'}
            </span>
          </div>
        </div>

        {/* Sponsor Logo / Branding */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="text-center">
            <div className="text-6xl mb-2">🏋️</div>
            <div className="text-sm font-bold text-gray-800">POWERED BY</div>
            <div className="text-lg font-black text-blue-900">LIFTING LIVE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
