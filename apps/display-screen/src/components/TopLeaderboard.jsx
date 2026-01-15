export default function TopLeaderboard({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div className="h-full bg-white border-4 border-black p-8">
        <h3 className="font-heading text-4xl font-black text-black mb-8 border-b-4 border-black pb-4">
          TOP 5 RANKINGS
        </h3>
        <div className="text-center text-gray-600 mt-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="font-heading text-2xl font-black">No rankings yet</p>
        </div>
      </div>
    );
  }

  const getRankNumber = (athlete) => {
    const rank = athlete.rank;
    return rank || athlete.athlete_id;
  };

  return (
    <div className="h-full bg-white border-4 border-black overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-black text-white p-8 border-b-4 border-black">
        <h3 className="font-heading text-4xl font-black text-center tracking-wider">
          TOP 5 RANKINGS
        </h3>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {leaderboard.map((athlete, index) => {
          return (
            <div
              key={athlete.athlete_id}
              className="bg-white border-2 border-black p-4 hover:bg-gray-100 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="bg-black text-white font-heading font-black w-16 h-16 flex items-center justify-center border-2 border-black text-2xl">
                  #{getRankNumber(athlete)}
                </div>

                {/* Athlete Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-heading text-2xl font-black text-black truncate">
                    {athlete.athlete_name}
                  </div>
                  <div className="font-heading text-lg text-black font-bold">
                    {athlete.country}
                  </div>
                </div>

                {/* Total Score */}
                <div className="text-right">
                  <div className="font-heading text-4xl font-black text-black">
                    {athlete.total || 0}
                  </div>
                  <div className="font-heading font-black text-black">
                    kg
                  </div>
                </div>
              </div>

              {/* Lift Details */}
              <div className="mt-3 grid grid-cols-2 gap-2 bg-gray-100 border-2 border-black p-2">
                <div className="text-center">
                  <div className="font-heading text-xs font-black text-black mb-1">SNATCH</div>
                  <div className="font-heading text-2xl font-black text-black">
                    {athlete.best_snatch || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-heading text-xs font-black text-black mb-1">C&J</div>
                  <div className="font-heading text-2xl font-black text-black">
                    {athlete.best_clean_and_jerk || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 p-4 text-center border-t-4 border-black">
        <p className="font-ui text-sm font-bold text-black">
          Updated in real-time • Sorted by Total, Bodyweight, Start Number
        </p>
      </div>
    </div>
  );
}
