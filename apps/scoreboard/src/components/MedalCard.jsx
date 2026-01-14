export default function MedalCard({ country, rank }) {
  const { country: name, gold, silver, bronze, total } = country;

  const getRankDisplay = () => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {/* Rank */}
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl">
          {getRankDisplay()}
        </div>

        {/* Country */}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{total} medal{total !== 1 ? 's' : ''}</p>
        </div>

        {/* Medal Counts */}
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl">🥇</div>
            <div className="text-sm font-bold text-gray-900">{gold}</div>
          </div>
          <div>
            <div className="text-2xl">🥈</div>
            <div className="text-sm font-bold text-gray-900">{silver}</div>
          </div>
          <div>
            <div className="text-2xl">🥉</div>
            <div className="text-sm font-bold text-gray-900">{bronze}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
