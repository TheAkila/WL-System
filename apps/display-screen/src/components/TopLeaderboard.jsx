export default function TopLeaderboard({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 p-6">
        <h3 className="text-3xl font-bold text-white mb-6 border-b-2 border-gray-600 pb-4">
          TOP 5 RANKINGS
        </h3>
        <div className="text-center text-gray-500 mt-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-xl">No rankings yet</p>
        </div>
      </div>
    );
  }

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-400';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border-2 border-gray-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 border-b-4 border-yellow-500">
        <h3 className="text-4xl font-black text-white text-center tracking-wider">
          TOP 5 RANKINGS
        </h3>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {leaderboard.map((athlete, index) => {
          const rank = athlete.rank || index + 1;
          
          return (
            <div
              key={athlete.athlete_id}
              className={`bg-gradient-to-r ${getRankColor(rank)} rounded-xl p-4 shadow-lg transform transition-all hover:scale-105`}
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="text-5xl font-black w-20 text-center">
                  {getRankBadge(rank)}
                </div>

                {/* Athlete Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-2xl font-bold text-white truncate">
                    {athlete.athlete_name}
                  </div>
                  <div className="text-lg text-gray-900 font-semibold">
                    {athlete.country}
                  </div>
                </div>

                {/* Total Score */}
                <div className="text-right">
                  <div className="text-5xl font-black text-white">
                    {athlete.total || 0}
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    kg
                  </div>
                </div>
              </div>

              {/* Lift Details */}
              <div className="mt-3 grid grid-cols-2 gap-2 bg-black bg-opacity-20 rounded-lg p-2">
                <div className="text-center">
                  <div className="text-xs text-gray-200">Snatch</div>
                  <div className="text-xl font-bold text-white">
                    {athlete.best_snatch || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-200">C&J</div>
                  <div className="text-xl font-bold text-white">
                    {athlete.best_clean_and_jerk || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-900 p-3 text-center border-t-2 border-gray-700">
        <p className="text-sm text-gray-400">
          Updated in real-time • Sorted by Total, Bodyweight, Start Number
        </p>
      </div>
    </div>
  );
}
