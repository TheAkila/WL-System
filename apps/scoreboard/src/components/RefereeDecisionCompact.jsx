import { CheckCircle, XCircle, Scale } from 'lucide-react';

export default function RefereeDecisionCompact({ attempt }) {
  if (!attempt || attempt.result === 'pending') {
    return null;
  }

  const decisions = {
    left: attempt.referee_left,
    center: attempt.referee_center,
    right: attempt.referee_right
  };

  const getLightColor = (decision) => {
    if (decision === 'good') return 'bg-white border-2 border-gray-600';
    if (decision === 'no-lift') return 'bg-red-600';
    return 'bg-gray-300';
  };

  const goodCount = [decisions.left, decisions.center, decisions.right]
    .filter(d => d === 'good').length;

  const finalResult = goodCount >= 2 ? 'good' : 'no-lift';

  // Check if jury override is active
  const isJuryOverride = attempt.jury_override === true;
  const juryDecision = attempt.jury_decision;

  return (
    <div className="bg-white border-4 border-black p-4">
      {/* Jury Override Badge */}
      {isJuryOverride && (
        <div className="flex items-center justify-center gap-2 mb-3 p-2 bg-amber-500 text-white rounded">
          <Scale size={16} />
          <span className="text-sm font-black">⚖️ JURY</span>
        </div>
      )}

      {/* Result Header */}
      <div className={`flex items-center justify-center gap-2 mb-4 p-3 rounded ${
        (isJuryOverride ? juryDecision : finalResult) === 'good' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {(isJuryOverride ? juryDecision : finalResult) === 'good' ? (
          <CheckCircle size={24} />
        ) : (
          <XCircle size={24} />
        )}
        <span className="text-xl font-black">
          {(isJuryOverride ? juryDecision : finalResult) === 'good' ? 'GOOD LIFT' : 'NO LIFT'}
        </span>
      </div>

      {/* Referee Lights */}
      <div className="grid grid-cols-3 gap-3">
        {/* LEFT */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-gray-600">L</div>
          <div className={`mx-auto w-12 h-12 rounded-full ${getLightColor(decisions.left)} flex items-center justify-center shadow-lg ${
            isJuryOverride ? 'opacity-50' : ''
          }`}>
            {decisions.left === 'good' && <CheckCircle size={20} className="text-gray-600" />}
            {decisions.left === 'no-lift' && <XCircle size={20} className="text-white" />}
          </div>
        </div>

        {/* CENTER */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-gray-600">C</div>
          <div className={`mx-auto w-12 h-12 rounded-full ${getLightColor(decisions.center)} flex items-center justify-center shadow-lg ${
            isJuryOverride ? 'opacity-50' : ''
          }`}>
            {decisions.center === 'good' && <CheckCircle size={20} className="text-gray-600" />}
            {decisions.center === 'no-lift' && <XCircle size={20} className="text-white" />}
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-center space-y-2">
          <div className="text-xs font-bold text-gray-600">R</div>
          <div className={`mx-auto w-12 h-12 rounded-full ${getLightColor(decisions.right)} flex items-center justify-center shadow-lg ${
            isJuryOverride ? 'opacity-50' : ''
          }`}>
            {decisions.right === 'good' && <CheckCircle size={20} className="text-gray-600" />}
            {decisions.right === 'no-lift' && <XCircle size={20} className="text-white" />}
          </div>
        </div>
      </div>

      {/* Decision Summary */}
      <div className="mt-3 text-center text-xs text-gray-600 font-medium">
        {isJuryOverride ? (
          <span className="text-amber-600 font-bold">Jury Override</span>
        ) : (
          `${goodCount}/3 Good`
        )}
      </div>
    </div>
  );
}
