import { CheckCircle, XCircle } from 'lucide-react';

export default function AttemptControl({ currentAttempt, onGoodLift, onNoLift, loading }) {
  if (!currentAttempt) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">⏳</div>
        <p className="text-gray-600 text-lg">No attempt in progress</p>
        <p className="text-gray-500 text-sm mt-2">
          Declare an attempt from the lifting order
        </p>
      </div>
    );
  }

  const { athlete, weight, lift_type, attempt_number, result } = currentAttempt;

  return (
    <div className="space-y-6">
      {/* Athlete Info */}
      <div className="bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 rounded-lg p-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">ATHLETE ON PLATFORM</div>
          <div className="text-3xl font-bold mb-2">{athlete?.name || 'Unknown'}</div>
          <div className="text-lg text-gray-600 mb-4">
            {athlete?.country} • Start #{athlete?.start_number}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">Lift Type</div>
              <div className="text-lg font-bold mt-1">
                {lift_type === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Attempt</div>
              <div className="text-lg font-bold mt-1">{attempt_number}/3</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Weight</div>
              <div className="text-3xl font-bold text-primary-600 mt-1">{weight} kg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Status */}
      {result !== 'pending' && (
        <div
          className={`text-center py-6 rounded-lg font-bold text-2xl ${
            result === 'good'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {result === 'good' ? '✓ GOOD LIFT' : '✗ NO LIFT'}
        </div>
      )}

      {/* Decision Buttons */}
      {result === 'pending' && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onGoodLift}
            disabled={loading}
            className="btn bg-green-600 text-white hover:bg-green-700 py-6 text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <CheckCircle size={32} />
            GOOD LIFT
          </button>
          <button
            onClick={onNoLift}
            disabled={loading}
            className="btn bg-red-600 text-white hover:bg-red-700 py-6 text-xl font-bold flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <XCircle size={32} />
            NO LIFT
          </button>
        </div>
      )}

      {/* Instructions */}
      {result === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Instructions:</strong> Click GOOD LIFT or NO LIFT to record the
            decision. This will automatically record all three referee decisions and
            advance to the next lifter.
          </p>
        </div>
      )}

      {/* Attempt History */}
      {athlete && (
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Athlete Stats</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Body Weight</div>
              <div className="font-semibold">{athlete.body_weight || '-'} kg</div>
            </div>
            <div>
              <div className="text-gray-500">Best Snatch</div>
              <div className="font-semibold">{athlete.best_snatch || 0} kg</div>
            </div>
            <div>
              <div className="text-gray-500">Best C&J</div>
              <div className="font-semibold">{athlete.best_clean_and_jerk || 0} kg</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
