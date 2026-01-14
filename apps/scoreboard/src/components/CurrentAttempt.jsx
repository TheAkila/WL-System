export default function CurrentAttempt({ attempt }) {
  if (!attempt) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">⏳</div>
        <p className="text-gray-500 text-lg">Waiting for next attempt...</p>
      </div>
    );
  }

  const getResultBadge = () => {
    if (attempt.result === 'good') {
      return <span className="badge badge-success text-lg">✓ GOOD LIFT</span>;
    }
    if (attempt.result === 'no-lift') {
      return <span className="badge badge-danger text-lg">✗ NO LIFT</span>;
    }
    return <span className="badge badge-warning text-lg">⏳ IN PROGRESS</span>;
  };

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
      <div className="text-center space-y-4">
        <div className="text-sm text-gray-600 font-medium">ON PLATFORM NOW</div>
        
        <div className="text-3xl md:text-4xl font-bold text-gray-900">
          {attempt.athlete?.name || 'Unknown Athlete'}
        </div>
        
        <div className="text-lg text-gray-600">
          {attempt.athlete?.country} • #{attempt.athlete?.startNumber}
        </div>

        <div className="flex items-center justify-center gap-6 py-6">
          <div className="text-center">
            <div className="text-sm text-gray-500">Lift</div>
            <div className="text-xl font-bold mt-1">
              {attempt.liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Attempt</div>
            <div className="text-xl font-bold mt-1">{attempt.attemptNumber}/3</div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Weight</div>
            <div className="text-4xl font-bold text-blue-600 mt-1">{attempt.weight} kg</div>
          </div>
        </div>

        <div className="pt-4">{getResultBadge()}</div>
      </div>
    </div>
  );
}
