import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * SessionCard Component - Phase 2 Enhanced Version
 * Displays session with state badge, progress indicators, and context-aware buttons
 */

const StateBadge = ({ state }) => {
  const stateConfig = {
    scheduled: { label: 'Scheduled', color: 'bg-slate-100 text-slate-700' },
    postponed: { label: 'Postponed', color: 'bg-orange-100 text-orange-700' },
    weighing: { label: 'Weighing', color: 'bg-blue-100 text-blue-700' },
    ready_to_start: { label: 'Ready to Start', color: 'bg-green-100 text-green-700' },
    active: { label: 'Active', color: 'bg-purple-100 text-purple-700' },
    snatch_active: { label: 'Snatch Active', color: 'bg-red-100 text-red-700' },
    snatch_complete: { label: 'Snatch Complete', color: 'bg-yellow-100 text-yellow-700' },
    clean_jerk_active: { label: 'C&J Active', color: 'bg-orange-100 text-orange-700' },
    complete: { label: 'Complete', color: 'bg-green-700 text-white' },
  };

  const config = stateConfig[state] || { label: state, color: 'bg-gray-100 text-gray-700' };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      {config.label}
    </span>
  );
};

const ProgressBar = ({ current, total, percentage }) => {
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-600">
          {current}/{total} completed
        </span>
        <span className="text-xs font-semibold text-slate-700">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const PhaseLockedIndicator = ({ phase }) => {
  return (
    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 flex items-center gap-2">
      <span>🔒</span>
      <span>
        <strong>{phase === 'snatch' ? 'Snatch' : 'Clean & Jerk'}</strong> phase is locked
      </span>
    </div>
  );
};

const SessionCardButton = ({ onClick, enabled, label, icon, loading = false }) => {
  if (!enabled) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded bg-slate-100 text-slate-400 text-sm font-medium cursor-not-allowed"
        title="This button will be available after the competition progresses"
      >
        <span className="text-lg">🔒</span>
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:bg-slate-400"
    >
      <span className="text-lg">{icon}</span>
      {loading ? 'Loading...' : label}
    </button>
  );
};

export default function SessionCard({
  session,
  onStateChange,
  onRefresh,
  selectedSession = false,
  className = '',
}) {
  const [stateConfig, setStateConfig] = useState(null);
  const [weighInSummary, setWeighInSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Load state configuration and weigh-in summary
  useEffect(() => {
    const fetchStateData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get state configuration
        const configResponse = await api.get(`/sessions/${session.id}/state-config`);
        if (configResponse.data.success) {
          setStateConfig(configResponse.data);
        }

        // Get weigh-in summary if in weighing state
        if (session.state === 'weighing') {
          const summaryResponse = await api.get(`/sessions/${session.id}/weigh-in-summary`);
          if (summaryResponse.data.success) {
            setWeighInSummary(summaryResponse.data);
          }
        }
      } catch (err) {
        console.error('Error fetching state data:', err);
        setError('Failed to load session state');
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) {
      fetchStateData();
    }
  }, [session?.id, session?.state]);

  const handleStateTransition = async (newState, label) => {
    try {
      setActionLoading(label);
      setError(null);

      let endpoint = '';
      switch (newState) {
        case 'weighing':
          endpoint = `/sessions/${session.id}/transitions/weigh-in`;
          break;
        case 'ready_to_start':
          endpoint = `/sessions/${session.id}/transitions/complete-weigh-in`;
          break;
        case 'active':
          endpoint = `/sessions/${session.id}/transitions/start-competition`;
          break;
        case 'snatch_active':
          endpoint = `/sessions/${session.id}/transitions/start-snatch`;
          break;
        case 'snatch_complete':
          endpoint = `/sessions/${session.id}/transitions/complete-snatch`;
          break;
        case 'clean_jerk_active':
          endpoint = `/sessions/${session.id}/transitions/start-clean-jerk`;
          break;
        case 'complete':
          endpoint = `/sessions/${session.id}/transitions/complete-clean-jerk`;
          break;
        default:
          return;
      }

      const response = await api.post(endpoint, {
        userId: localStorage.getItem('userId'),
      });

      if (response.data.success) {
        // Update parent component
        onStateChange && onStateChange(response.data);
        onRefresh && onRefresh();
      } else {
        setError(response.data.message || 'Failed to transition state');
      }
    } catch (err) {
      console.error('Error transitioning state:', err);
      setError(err.response?.data?.message || 'Failed to transition state');
    } finally {
      setActionLoading(null);
    }
  };

  if (!stateConfig && !loading) {
    return <div className="p-4 text-slate-500">Unable to load session</div>;
  }

  const buttons = stateConfig?.buttons || {};
  const canTransition = stateConfig?.canTransitionTo || [];

  return (
    <div
      className={`border-2 ${
        selectedSession ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
      } rounded-lg p-6 hover:shadow-lg transition-all ${className}`}
    >
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Header with State Badge and Quick Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900">{session.name}</h3>
          <p className="text-sm text-slate-600 mt-1">
            {session.gender === 'male' ? '🚹 Men' : '🚺 Women'} • {session.weight_category}kg
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-2">Current State</p>
            <StateBadge state={session.state} />
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      {session.state === 'weighing' && weighInSummary && (
        <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 mb-2">Weigh-in Progress</p>
          <ProgressBar
            current={weighInSummary.weighed_in}
            total={weighInSummary.total_athletes}
            percentage={Math.round(weighInSummary.completion_percentage)}
          />
        </div>
      )}

      {session.state === 'snatch_active' && (
        <div className="mb-4">
          <PhaseLockedIndicator phase="clean_jerk" />
        </div>
      )}

      {session.state === 'clean_jerk_active' && (
        <div className="mb-4">
          <PhaseLockedIndicator phase="snatch" />
        </div>
      )}

      {/* Session Details */}
      <div className="mb-4 text-xs text-slate-600 space-y-1">
        {session.competition && <p>📋 {session.competition.name}</p>}
        {session.location && <p>📍 {session.location}</p>}
      </div>

      {/* Action Buttons - State Transitions */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
        <div className="mb-3">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            📊 Change Session State
          </label>
          <p className="text-xs text-slate-600 mb-3">
            Click a button below to transition the session to the next state. Disabled buttons are not available for the current state.
          </p>
        </div>
        
        <div className="space-y-2">
          {/* Row 1: Check-in Phase */}
          <div className="flex flex-wrap gap-2">
            <SessionCardButton
              enabled={buttons.weigh_in}
              onClick={() => handleStateTransition('weighing', 'Start Weigh In')}
              label="📋 Start Weigh In"
              icon=""
              loading={actionLoading === 'Start Weigh In'}
            />
            <SessionCardButton
              enabled={buttons.start_competition}
              onClick={() => handleStateTransition('active', 'Start Competition')}
              label="🎯 Start Competition"
              icon=""
              loading={actionLoading === 'Start Competition'}
            />
          </div>

          {/* Row 2: Snatch Phase */}
          <div className="flex flex-wrap gap-2">
            <SessionCardButton
              enabled={buttons.start_snatch}
              onClick={() => handleStateTransition('snatch_active', 'Start Snatch')}
              label="💪 Start Snatch"
              icon=""
              loading={actionLoading === 'Start Snatch'}
            />
            <SessionCardButton
              enabled={buttons.complete_snatch}
              onClick={() => handleStateTransition('snatch_complete', 'Complete Snatch')}
              label="✅ Complete Snatch"
              icon=""
              loading={actionLoading === 'Complete Snatch'}
            />
          </div>

          {/* Row 3: Clean & Jerk Phase */}
          <div className="flex flex-wrap gap-2">
            <SessionCardButton
              enabled={buttons.start_clean_jerk}
              onClick={() => handleStateTransition('clean_jerk_active', 'Start C&J')}
              label="🔥 Start Clean & Jerk"
              icon=""
              loading={actionLoading === 'Start C&J'}
            />
            <SessionCardButton
              enabled={buttons.complete_clean_jerk}
              onClick={() => handleStateTransition('complete', 'Finish')}
              label="🏁 Finish Competition"
              icon=""
              loading={actionLoading === 'Finish'}
            />
          </div>
        </div>
      </div>

      {/* State Description */}
      <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
        <p>State: <span className="font-mono font-semibold text-slate-700">{session.state}</span></p>
      </div>
    </div>
  );
}
