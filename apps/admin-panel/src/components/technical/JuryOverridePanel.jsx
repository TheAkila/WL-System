import { useState, useEffect } from 'react';
import { Scale, AlertTriangle, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const JuryOverridePanel = ({ attempt, onOverrideRecorded }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingDecision, setPendingDecision] = useState(null);

  // Reset form when attempt changes
  useEffect(() => {
    setReason('');
    setShowConfirmDialog(false);
    setPendingDecision(null);
  }, [attempt?.id]);

  if (!attempt || !attempt.id) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Scale className="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">No active attempt to override</p>
      </div>
    );
  }

  // Calculate referee result
  const getRefereeResult = () => {
    const { referee_left, referee_center, referee_right } = attempt;
    if (!referee_left || !referee_center || !referee_right) {
      return { result: 'pending', count: 0 };
    }

    const goodCount = [referee_left, referee_center, referee_right].filter(
      (d) => d === 'good'
    ).length;

    return {
      result: goodCount >= 2 ? 'good' : 'no-lift',
      count: goodCount,
    };
  };

  const refereeResult = getRefereeResult();

  // Get light color
  const getLightColor = (decision) => {
    if (!decision) return 'bg-gray-300';
    return decision === 'good'
      ? 'bg-white border-2 border-gray-400 shadow-lg'
      : 'bg-red-600 shadow-lg shadow-red-500/50';
  };

  const handleOverrideClick = (decision) => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the jury override');
      return;
    }
    setPendingDecision(decision);
    setShowConfirmDialog(true);
  };

  const handleConfirmOverride = async () => {
    if (!pendingDecision || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await api.post(
        `/technical/attempts/${attempt.id}/jury-override`,
        {
          decision: pendingDecision,
          reason: reason.trim(),
        }
      );

      toast.success(
        `Jury override recorded: ${
          pendingDecision === 'good' ? 'GOOD LIFT' : 'NO LIFT'
        }`
      );

      setReason('');
      setShowConfirmDialog(false);
      setPendingDecision(null);

      if (onOverrideRecorded) {
        onOverrideRecorded(response.data.data);
      }
    } catch (error) {
      console.error('Error recording jury override:', error);
      toast.error(error.response?.data?.message || 'Failed to record jury override');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOverride = () => {
    setShowConfirmDialog(false);
    setPendingDecision(null);
  };

  // If already overridden, show info
  if (attempt.jury_override) {
    return (
      <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Scale className="w-8 h-8 text-amber-600" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900">
              Jury Override Applied
            </h3>
            <p className="text-sm text-amber-700">
              IWF Rule 3.3.5 - Jury Decision Takes Precedence
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-600 mb-2">Jury Decision:</p>
            <div className="flex items-center gap-2">
              {attempt.jury_decision === 'good' ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    GOOD LIFT
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <span className="text-xl font-bold text-red-600">NO LIFT</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-600 mb-2">Reason:</p>
            <p className="text-gray-800">{attempt.jury_reason}</p>
          </div>

          {attempt.jury_timestamp && (
            <div className="bg-white rounded p-4">
              <p className="text-sm text-gray-600 mb-1">Timestamp:</p>
              <p className="text-gray-800">
                {new Date(attempt.jury_timestamp).toLocaleString()}
              </p>
            </div>
          )}

          {/* Show referee decisions for reference */}
          <div className="bg-white rounded p-4">
            <p className="text-sm text-gray-600 mb-3">
              Original Referee Decision (Overridden):
            </p>
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                      attempt.referee_left
                    )}`}
                  >
                    {attempt.referee_left === 'good' ? (
                      <Lightbulb className="w-8 h-8 text-gray-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Left</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                      attempt.referee_center
                    )}`}
                  >
                    {attempt.referee_center === 'good' ? (
                      <Lightbulb className="w-8 h-8 text-gray-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Center</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                      attempt.referee_right
                    )}`}
                  >
                    {attempt.referee_right === 'good' ? (
                      <Lightbulb className="w-8 h-8 text-gray-600" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">Right</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              {refereeResult.result === 'pending'
                ? 'Incomplete'
                : `${refereeResult.count}/3 Good Lift - ${
                    refereeResult.result === 'good' ? 'GOOD LIFT' : 'NO LIFT'
                  }`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-amber-300 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Scale className="w-8 h-8 text-amber-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Jury Override</h3>
          <p className="text-sm text-gray-600">
            IWF Rule 3.3.5 - Override referee decision
          </p>
        </div>
      </div>

      {/* Referee Decision Reference */}
      <div className="bg-gray-50 rounded p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Current Referee Decision:
        </p>
        <div className="flex items-center justify-center gap-8 mb-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                  attempt.referee_left
                )}`}
              >
                {attempt.referee_left === 'good' ? (
                  <Lightbulb className="w-8 h-8 text-gray-600" />
                ) : attempt.referee_left === 'no-lift' ? (
                  <XCircle className="w-8 h-8 text-white" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Left</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                  attempt.referee_center
                )}`}
              >
                {attempt.referee_center === 'good' ? (
                  <Lightbulb className="w-8 h-8 text-gray-600" />
                ) : attempt.referee_center === 'no-lift' ? (
                  <XCircle className="w-8 h-8 text-white" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Center</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${getLightColor(
                  attempt.referee_right
                )}`}
              >
                {attempt.referee_right === 'good' ? (
                  <Lightbulb className="w-8 h-8 text-gray-600" />
                ) : attempt.referee_right === 'no-lift' ? (
                  <XCircle className="w-8 h-8 text-white" />
                ) : (
                  <Lightbulb className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <p className="text-xs text-gray-600">Right</p>
          </div>
        </div>

        {refereeResult.result !== 'pending' && (
          <div className="text-center">
            <span
              className={`inline-block px-4 py-2 rounded font-bold ${
                refereeResult.result === 'good'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {refereeResult.count}/3 Good -{' '}
              {refereeResult.result === 'good' ? 'GOOD LIFT' : 'NO LIFT'}
            </span>
          </div>
        )}

        {refereeResult.result === 'pending' && (
          <p className="text-center text-gray-500 text-sm">
            Waiting for all referee decisions
          </p>
        )}
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Admin Only</p>
            <p>
              Jury override is irreversible and takes precedence over all referee
              decisions. Use only in cases of technical violations or procedural
              issues per IWF rules.
            </p>
          </div>
        </div>
      </div>

      {/* Reason Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for Override (Required)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter detailed reason for jury override (e.g., technical violation, procedural issue)..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {/* Override Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleOverrideClick('good')}
          disabled={isSubmitting || !reason.trim()}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <CheckCircle className="w-5 h-5" />
          JURY: GOOD LIFT
        </button>

        <button
          onClick={() => handleOverrideClick('no-lift')}
          disabled={isSubmitting || !reason.trim()}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <XCircle className="w-5 h-5" />
          JURY: NO LIFT
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <h3 className="text-xl font-bold text-gray-900">
                Confirm Jury Override
              </h3>
            </div>

            <div className="mb-4 space-y-3">
              <p className="text-gray-700">
                You are about to override the referee decision with:
              </p>
              <div
                className={`p-4 rounded ${
                  pendingDecision === 'good'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <p className="font-bold text-lg">
                  {pendingDecision === 'good' ? 'GOOD LIFT' : 'NO LIFT'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600 mb-1 font-medium">Reason:</p>
                <p className="text-gray-800">{reason}</p>
              </div>

              <p className="text-sm text-amber-700 font-semibold">
                ⚠️ This action is irreversible and will be recorded with timestamp.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelOverride}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 font-semibold"
              >
                {isSubmitting ? 'Recording...' : 'Confirm Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JuryOverridePanel;
