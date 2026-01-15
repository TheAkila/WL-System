export default function Leaderboard() {
  // Mock data - will be replaced with real data
  const athletes = [
    { name: 'John Doe', country: 'USA', total: 320, rank: 1 },
    { name: 'Jane Smith', country: 'CAN', total: 315, rank: 2 },
    { name: 'Mike Johnson', country: 'GBR', total: 310, rank: 3 },
  ];

  return (
    <div className="bg-white border-4 border-black p-8 h-full">
      <h2 className="font-heading text-3xl font-black mb-6 text-center text-black border-b-4 border-black pb-4">LEADERBOARD</h2>
      <div className="space-y-2">
        {athletes.map((athlete) => (
          <div
            key={athlete.rank}
            className="bg-gray-100 border-2 border-black p-4 flex items-center justify-between hover:bg-gray-200 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`font-heading font-black text-3xl w-12 h-12 flex items-center justify-center border-2 border-black ${
                  athlete.rank === 1
                    ? 'bg-black text-white'
                    : athlete.rank === 2
                    ? 'bg-gray-400 text-white'
                    : 'bg-gray-300 text-white'
                }`}
              >
                #{athlete.rank}
              </div>
              <div>
                <div className="font-heading text-xl font-black text-black">{athlete.name}</div>
                <div className="font-heading font-bold text-black">{athlete.country}</div>
              </div>
            </div>
            <div className="font-heading text-3xl font-black text-black">{athlete.total} kg</div>
          </div>
        ))}
      </div>
    </div>
  );
}
