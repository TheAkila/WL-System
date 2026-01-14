export default function LeaderboardCard({ athlete }) {
  const rank = athlete.rank || 0;
  const medal = athlete.medal;
  
  const getRankBadge = () => {
    // Prioritize medal if assigned
    if (medal === 'gold') {
      return { emoji: '🥇', bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-900' };
    }
    if (medal === 'silver') {
      return { emoji: '🥈', bg: 'from-gray-300 to-gray-400', text: 'text-gray-900' };
    }
    if (medal === 'bronze') {
      return { emoji: '🥉', bg: 'from-orange-400 to-orange-600', text: 'text-orange-900' };
    }
    
    // Otherwise use rank
    switch (rank) {
      case 1: return { emoji: '🥇', bg: 'from-yellow-400 to-yellow-600', text: 'text-yellow-900' };
      case 2: return { emoji: '🥈', bg: 'from-gray-300 to-gray-400', text: 'text-gray-900' };
      case 3: return { emoji: '🥉', bg: 'from-orange-400 to-orange-600', text: 'text-orange-900' };
      default: return { emoji: `#${rank}`, bg: 'from-blue-400 to-blue-600', text: 'text-blue-900' };
    }
  };

  const badge = getRankBadge();

  return (
    <div className={`bg-gradient-to-r ${badge.bg} rounded-lg shadow-lg overflow-hidden`}>
      <div className="flex items-center gap-4 p-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
          <span className="text-4xl">{badge.emoji}</span>
        </div>

        {/* Athlete Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl text-white truncate">
            {athlete.athlete_name}
          </h3>
          <p className={`text-sm font-semibold ${badge.text}`}>
            {athlete.country}
          </p>
        </div>

        {/* Total */}
        <div className="text-right">
          <div className="text-4xl font-black text-white">
            {athlete.total || 0}
          </div>
          <div className={`text-xs font-bold ${badge.text}`}>kg</div>
        </div>
      </div>

      {/* Lift Breakdown */}
      <div className="bg-black bg-opacity-20 px-4 py-2 grid grid-cols-2 gap-4 text-center text-white text-sm">
        <div>
          <div className="opacity-75">Snatch</div>
          <div className="font-bold text-lg">{athlete.best_snatch || 0}</div>
        </div>
        <div>
          <div className="opacity-75">Clean & Jerk</div>
          <div className="font-bold text-lg">{athlete.best_clean_and_jerk || 0}</div>
        </div>
      </div>
    </div>
  );
}
