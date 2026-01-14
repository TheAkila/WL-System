export default function Leaderboard() {
  // Mock data - will be replaced with real data
  const athletes = [
    { name: 'John Doe', country: 'USA', total: 320, rank: 1 },
    { name: 'Jane Smith', country: 'CAN', total: 315, rank: 2 },
    { name: 'Mike Johnson', country: 'GBR', total: 310, rank: 3 },
  ];

  return (
    <div className="bg-gray-800 rounded-2xl p-6 h-full">
      <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">LEADERBOARD</h2>
      <div className="space-y-3">
        {athletes.map((athlete) => (
          <div
            key={athlete.rank}
            className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={`text-3xl font-bold ${
                  athlete.rank === 1
                    ? 'text-yellow-400'
                    : athlete.rank === 2
                    ? 'text-gray-300'
                    : 'text-orange-600'
                }`}
              >
                #{athlete.rank}
              </div>
              <div>
                <div className="text-xl font-semibold">{athlete.name}</div>
                <div className="text-gray-400">{athlete.country}</div>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">{athlete.total} kg</div>
          </div>
        ))}
      </div>
    </div>
  );
}
