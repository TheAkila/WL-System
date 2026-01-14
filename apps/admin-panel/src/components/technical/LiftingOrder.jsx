import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function LiftingOrder({ athletes, currentAttempt, onDeclareAttempt, loading }) {
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [attemptWeights, setAttemptWeights] = useState({});

  if (!athletes || athletes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>All attempts completed for current lift</p>
      </div>
    );
  }

  const handleDeclare = (athleteId) => {
    const weight = attemptWeights[athleteId];
    if (!weight || weight <= 0) {
      alert('Please enter a valid weight');
      return;
    }
    onDeclareAttempt(athleteId, parseInt(weight));
    setAttemptWeights({ ...attemptWeights, [athleteId]: '' });
    setExpandedAthlete(null);
  };

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {athletes.map((athlete, index) => {
        const isExpanded = expandedAthlete === athlete.athlete_id;
        const isCurrentAttempt = currentAttempt?.athlete_id === athlete.athlete_id;
        const isNext = index === 0 && !currentAttempt;

        return (
          <div
            key={athlete.athlete_id}
            className={`border rounded-lg p-4 ${
              isCurrentAttempt
                ? 'border-blue-500 bg-blue-50'
                : isNext
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">
                    #{athlete.lifting_order}
                  </span>
                  <div>
                    <div className="font-semibold text-lg">{athlete.athlete_name}</div>
                    <div className="text-sm text-gray-600">
                      {athlete.country} • Start #{athlete.start_number}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right mr-4">
                <div className="text-sm text-gray-600">
                  {athlete.lift_type === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
                </div>
                <div className="text-lg font-bold">
                  Attempt {athlete.attempt_number}/3
                </div>
                {athlete.requested_weight > 0 && (
                  <div className="text-2xl font-bold text-primary-600">
                    {athlete.requested_weight} kg
                  </div>
                )}
              </div>

              <button
                onClick={() =>
                  setExpandedAthlete(isExpanded ? null : athlete.athlete_id)
                }
                className="btn btn-secondary p-2"
                disabled={isCurrentAttempt}
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            {isExpanded && !isCurrentAttempt && (
              <div className="mt-4 pt-4 border-t flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={attemptWeights[athlete.athlete_id] || ''}
                  onChange={(e) =>
                    setAttemptWeights({
                      ...attemptWeights,
                      [athlete.athlete_id]: e.target.value,
                    })
                  }
                  className="input flex-1"
                  min="1"
                  max="500"
                />
                <button
                  onClick={() => handleDeclare(athlete.athlete_id)}
                  disabled={loading || !attemptWeights[athlete.athlete_id]}
                  className="btn btn-primary"
                >
                  Declare Attempt
                </button>
              </div>
            )}

            {isCurrentAttempt && (
              <div className="mt-4 pt-4 border-t">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded text-center font-semibold">
                  🎯 ATHLETE ON PLATFORM
                </div>
              </div>
            )}

            {isNext && !currentAttempt && (
              <div className="mt-4 pt-4 border-t">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded text-center font-semibold">
                  ⭐ NEXT UP
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
