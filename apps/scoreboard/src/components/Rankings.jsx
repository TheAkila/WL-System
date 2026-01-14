export default function Rankings({ athletes }) {
  if (!athletes || athletes.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Rankings</h2>
        <p className="text-gray-500 text-center py-8">No rankings available yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Rankings</h2>
      
      <div className="space-y-3">
        {athletes.map((athlete, index) => (
          <div
            key={athlete.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={`text-2xl font-bold w-10 text-center ${
                  index === 0
                    ? 'text-yellow-500'
                    : index === 1
                    ? 'text-gray-400'
                    : index === 2
                    ? 'text-orange-600'
                    : 'text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-lg">{athlete.name}</div>
                <div className="text-sm text-gray-600">
                  {athlete.country} • {athlete.bodyWeight} kg
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {athlete.total || 0} kg
              </div>
              <div className="text-xs text-gray-500">
                S: {athlete.snatch || 0} • C&J: {athlete.cleanAndJerk || 0}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
