import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Circle, Users, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function RefereeDecisionPanel({ attempt, onDecisionRecorded }) {
  const [decisions, setDecisions] = useState({
    left: null,
    center: null,
    right: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local state when attempt changes
  useEffect(() => {
    if (attempt) {
      setDecisions({
        left: attempt.referee_left,
        center: attempt.referee_center,
        right: attempt.referee_right
      });
    }
  }, [attempt]);

  const handleIndividualDecision = async (position, decision) => {
    if (!attempt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post(`/technical/attempts/${attempt.id}/decision`, {
        position,
        decision
      });

      setDecisions(prev => ({ ...prev, [position]: decision }));
      toast.success(`${position.toUpperCase()} referee: ${decision === 'good' ? 'Good lift' : 'No lift'}`);
      
      if (onDecisionRecorded) {
        onDecisionRecorded();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to record decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDecision = async (decision) => {
    if (!attempt || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.post(`/technical/attempts/${attempt.id}/quick-decision`, {
        decision
      });

      setDecisions({
        left: decision,
        center: decision,
        right: decision
      });

      toast.success(
        decision === 'good' 
          ? '✅ All referees: GOOD LIFT' 
          : '❌ All referees: NO LIFT',
        { duration: 3000 }
      );

      if (onDecisionRecorded) {
        onDecisionRecorded();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to record decision');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getResultPreview = () => {
    const goodCount = [decisions.left, decisions.center, decisions.right]
      .filter(d => d === 'good').length;
    const totalDecisions = [decisions.left, decisions.center, decisions.right]
      .filter(d => d !== null).length;

    if (totalDecisions < 3) {
      return { 
        text: `Waiting for ${3 - totalDecisions} decision${3 - totalDecisions > 1 ? 's' : ''}`, 
        color: 'text-gray-500',
        icon: Circle
      };
    }

    if (goodCount >= 2) {
      return { 
        text: 'GOOD LIFT', 
        color: 'text-green-600',
        icon: CheckCircle
      };
    } else {
      return { 
        text: 'NO LIFT', 
        color: 'text-slate-600',
        icon: XCircle
      };
    }
  };

  const getLightColor = (decision) => {
    if (decision === null) return 'bg-gray-300 dark:bg-gray-600'; // Off
    if (decision === 'good') return 'bg-white border-2 border-gray-400 shadow-lg'; // White light
    if (decision === 'no-lift') return 'bg-slate-600 shadow-lg shadow-slate-500/50'; // Dark light
    return 'bg-gray-300';
  };

  const getLightGlow = (decision) => {
    if (decision === 'good') return 'shadow-2xl shadow-white/80';
    if (decision === 'no-lift') return 'shadow-2xl shadow-slate-500/80';
    return '';
  };

  const result = getResultPreview();
  const ResultIcon = result.icon;

  if (!attempt || attempt.result !== 'pending') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="text-blue-600" size={24} />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Referee Decisions
          </h3>
        </div>
        <div className={`flex items-center gap-2 text-lg font-bold ${result.color}`}>
          <ResultIcon size={24} />
          <span>{result.text}</span>
        </div>
      </div>

      {/* Quick Decision Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleQuickDecision('good')}
          disabled={isSubmitting || decisions.left !== null}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <CheckCircle size={24} />
          <span>ALL GOOD LIFT</span>
        </button>
        <button
          onClick={() => handleQuickDecision('no-lift')}
          disabled={isSubmitting || decisions.left !== null}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <XCircle size={24} />
          <span>ALL NO LIFT</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          OR INDIVIDUAL DECISIONS
        </span>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
      </div>

      {/* Individual Referee Panels */}
      <div className="grid grid-cols-3 gap-4">
        {/* LEFT Referee */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              LEFT
            </div>
            <div className={`mx-auto w-20 h-20 rounded-full ${getLightColor(decisions.left)} ${getLightGlow(decisions.left)} transition-all duration-300 flex items-center justify-center`}>
              {decisions.left === 'good' && <Lightbulb className="text-yellow-400" size={32} />}
              {decisions.left === 'no-lift' && <XCircle className="text-white" size={32} />}
              {decisions.left === null && <Circle className="text-gray-400" size={32} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleIndividualDecision('left', 'good')}
              disabled={isSubmitting || decisions.left !== null}
              className="px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-600 text-green-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              GOOD
            </button>
            <button
              onClick={() => handleIndividualDecision('left', 'no-lift')}
              disabled={isSubmitting || decisions.left !== null}
              className="px-3 py-2 bg-white hover:bg-slate-50 border-2 border-slate-600 text-slate-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              NO LIFT
            </button>
          </div>
        </div>

        {/* CENTER Referee */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              CENTER
            </div>
            <div className={`mx-auto w-20 h-20 rounded-full ${getLightColor(decisions.center)} ${getLightGlow(decisions.center)} transition-all duration-300 flex items-center justify-center`}>
              {decisions.center === 'good' && <Lightbulb className="text-yellow-400" size={32} />}
              {decisions.center === 'no-lift' && <XCircle className="text-white" size={32} />}
              {decisions.center === null && <Circle className="text-gray-400" size={32} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleIndividualDecision('center', 'good')}
              disabled={isSubmitting || decisions.center !== null}
              className="px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-600 text-green-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              GOOD
            </button>
            <button
              onClick={() => handleIndividualDecision('center', 'no-lift')}
              disabled={isSubmitting || decisions.center !== null}
              className="px-3 py-2 bg-white hover:bg-slate-50 border-2 border-slate-600 text-slate-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              NO LIFT
            </button>
          </div>
        </div>

        {/* RIGHT Referee */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
              RIGHT
            </div>
            <div className={`mx-auto w-20 h-20 rounded-full ${getLightColor(decisions.right)} ${getLightGlow(decisions.right)} transition-all duration-300 flex items-center justify-center`}>
              {decisions.right === 'good' && <Lightbulb className="text-yellow-400" size={32} />}
              {decisions.right === 'no-lift' && <XCircle className="text-white" size={32} />}
              {decisions.right === null && <Circle className="text-gray-400" size={32} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleIndividualDecision('right', 'good')}
              disabled={isSubmitting || decisions.right !== null}
              className="px-3 py-2 bg-white hover:bg-green-50 border-2 border-green-600 text-green-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              GOOD
            </button>
            <button
              onClick={() => handleIndividualDecision('right', 'no-lift')}
              disabled={isSubmitting || decisions.right !== null}
              className="px-3 py-2 bg-white hover:bg-slate-50 border-2 border-slate-600 text-slate-600 rounded font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              NO LIFT
            </button>
          </div>
        </div>
      </div>

      {/* IWF Rule Reminder */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-4 rounded">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>IWF Rule:</strong> Majority decision (2 out of 3 good lifts = successful attempt)
        </p>
      </div>
    </div>
  );
}
