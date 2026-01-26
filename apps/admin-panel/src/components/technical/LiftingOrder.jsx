import { useState } from 'react';
import { ChevronDown, ChevronUp, Award, Target, Clock, TrendingUp } from 'lucide-react';
import WeightChangeModal from './WeightChangeModal';

export default function LiftingOrder({ athletes, currentAttempt, onDeclareAttempt, loading, liftType, sessionId }) {
  const [expandedAthlete, setExpandedAthlete] = useState(null);
  const [attemptWeights, setAttemptWeights] = useState({});
  const [weightChangeModal, setWeightChangeModal] = useState(null);

  if (!athletes || athletes.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-zinc-500">
        <Award className="mx-auto mb-4 text-slate-300 dark:text-zinc-600" size={64} />
        <p className="text-lg font-ui">All attempts completed for current lift</p>
        <p className="text-sm mt-2">Move to next phase or view results</p>
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

  // Determine positions
  const currentLifter = !currentAttempt && athletes[0];
  const onDeck = !currentAttempt && athletes[1];
  const inHole = !currentAttempt && athletes[2];

  return (
    <div className="space-y-4">
      {/* Top 3 Positions */}
      {!currentAttempt && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Current Lifter */}
          {currentLifter && (
            <div className="card p-4 border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-blue-600" size={20} />
                <span className="text-xs font-heading font-bold text-blue-600 uppercase tracking-wider">
                  Current
                </span>
              </div>
              <div className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                {currentLifter.name}
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                {currentLifter.country} • #{currentLifter.start_number}
              </div>
              <div className="text-3xl font-heading font-black text-blue-600 mt-2">
                {currentLifter.requested_weight} kg
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Attempt {currentLifter.attempt_number}/3
              </div>
            </div>
          )}

          {/* On Deck */}
          {onDeck && (
            <div className="card p-4 border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-green-600" size={20} />
                <span className="text-xs font-heading font-bold text-green-600 uppercase tracking-wider">
                  On Deck
                </span>
              </div>
              <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {onDeck.name}
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                {onDeck.country} • #{onDeck.start_number}
              </div>
              <div className="text-2xl font-heading font-black text-green-600 mt-2">
                {onDeck.requested_weight} kg
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Attempt {onDeck.attempt_number}/3
              </div>
            </div>
          )}

          {/* In The Hole */}
          {inHole && (
            <div className="card p-4 border-2 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-orange-600" size={20} />
                <span className="text-xs font-heading font-bold text-orange-600 uppercase tracking-wider">
                  In The Hole
                </span>
              </div>
              <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                {inHole.name}
              </div>
              <div className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                {inHole.country} • #{inHole.start_number}
              </div>
              <div className="text-2xl font-heading font-black text-orange-600 mt-2">
                {inHole.requested_weight} kg
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Attempt {inHole.attempt_number}/3
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full Lifting Order List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto">
        {athletes.map((athlete, index) => {
          const isExpanded = expandedAthlete === athlete.athlete_id;
          const isCurrentAttempt = currentAttempt?.athlete_id === athlete.athlete_id;
          const isCurrent = index === 0 && !currentAttempt;
          const isOnDeck = index === 1 && !currentAttempt;
          const isInHole = index === 2 && !currentAttempt;

          let borderColor = 'border-slate-200 dark:border-zinc-700';
          let bgColor = 'bg-white dark:bg-zinc-800';
          
          if (isCurrentAttempt || isCurrent) {
            borderColor = 'border-blue-500';
            bgColor = 'bg-blue-50 dark:bg-blue-900/20';
          } else if (isOnDeck) {
            borderColor = 'border-green-500';
            bgColor = 'bg-green-50 dark:bg-green-900/20';
          } else if (isInHole) {
            borderColor = 'border-orange-500';
            bgColor = 'bg-orange-50 dark:bg-orange-900/20';
          }

          return (
            <div
              key={athlete.athlete_id}
              className={`border-2 rounded-xl p-4 ${borderColor} ${bgColor} transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 flex items-center gap-4">
                  <div className="text-3xl font-heading font-black text-slate-300 dark:text-zinc-600">
                    {index + 1}
                  </div>
                  <div className="flex items-center gap-3">
                    {athlete.team_logo && (
                      <img
                        src={athlete.team_logo}
                        alt={athlete.team_name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    )}
                    <div>
                      <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                        #{athlete.start_number} {athlete.name}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-zinc-400">
                        {athlete.country} • {athlete.team_name || 'No Team'} • Lot #{athlete.lot_number}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right mr-4">
                  <div className="text-sm text-slate-600 dark:text-zinc-400 font-ui">
                    Attempt {athlete.attempt_number}/3
                  </div>
                  <div className="text-3xl font-heading font-black text-slate-900 dark:text-white">
                    {athlete.requested_weight} kg
                  </div>
                  {athlete.last_attempt_result && (
                    <div className={`text-xs font-ui mt-1 ${
                      athlete.last_attempt_result === 'success' 
                        ? 'text-green-600' 
                        : 'text-slate-600'
                    }`}>
                      Last: {athlete.last_attempt_result === 'success' ? '✓ Success' : '✗ Failed'}
                    </div>
                  )}
                  
                  {/* Change Weight Button */}
                  {!isCurrentAttempt && athlete.attempt_number < 3 && (
                    <button
                      onClick={() => setWeightChangeModal({
                        athlete: {
                          id: athlete.athlete_id,
                          name: athlete.name
                        },
                        currentWeight: athlete.requested_weight,
                        attemptNumber: athlete.attempt_number
                      })}
                      className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      <TrendingUp size={14} />
                      Change Weight
                    </button>
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

              {/* Attempt History */}
              {isExpanded && athlete.attempts && athlete.attempts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-700">
                  <div className="text-sm font-heading font-semibold text-slate-700 dark:text-zinc-300 mb-2">
                    Attempt History:
                  </div>
                  <div className="flex gap-2">
                    {athlete.attempts.map((att, i) => (
                      <div
                        key={i}
                        className={`px-3 py-2 rounded-lg text-sm font-ui ${
                          att.result === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : att.result === 'fail'
                            ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        #{att.number}: {att.weight}kg {att.result === 'success' ? '✓' : att.result === 'fail' ? '✗' : '-'}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isCurrentAttempt && (
                <div className="mt-4 pt-4 border-t border-blue-300">
                  <div className="bg-blue-600 text-white px-4 py-3 rounded-xl text-center font-heading font-bold text-lg">
                    🎯 ATHLETE ON PLATFORM
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weight Change Modal */}
      {weightChangeModal && (
        <WeightChangeModal
          athlete={weightChangeModal.athlete}
          liftType={liftType}
          sessionId={sessionId}
          currentWeight={weightChangeModal.currentWeight}
          attemptNumber={weightChangeModal.attemptNumber}
          onClose={() => setWeightChangeModal(null)}
          onSuccess={() => {
            // Modal will trigger Socket.IO update which will refresh the order
            console.log('Weight change requested successfully');
          }}
        />
      )}
    </div>
  );
}
