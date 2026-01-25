import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * PhaseControlButtons Component - Phase 2 New Component
 * Displays snatch/clean jerk phase transition buttons with locked state indication
 * Typically placed in the session header next to Print button
 */

const PhaseButton = ({
  phase,
  enabled,
  isActive,
  isLocked,
  onClick,
  loading,
}) => {
  const phaseConfig = {
    snatch: {
      label: 'Snatch',
      icon: '💪',
      color: 'bg-red-500 hover:bg-red-600',
    },
    clean_jerk: {
      label: 'Clean & Jerk',
      icon: '🔥',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  };

  const config = phaseConfig[phase];

  if (!enabled && !isActive) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded bg-slate-200 text-slate-500 font-medium cursor-not-allowed text-sm"
        title={isLocked ? `${config.label} phase is locked` : `${config.label} will be available later`}
      >
        <span className="text-lg">🔒</span>
        {config.label}
      </button>
    );
  }

  if (isActive) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 rounded ${config.color} text-white font-medium text-sm ring-2 ring-offset-2 ring-offset-white cursor-default`}
        style={{ ringColor: config.color.split(' ')[0] === 'bg-red-500' ? '#ef4444' : '#f97316' }}
      >
        <span className="text-lg">{config.icon}</span>
        {config.label}
        <span className="ml-1 text-xs">ACTIVE</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={loading || !enabled}
      className={`flex items-center gap-2 px-4 py-2 rounded ${config.color} text-white font-medium hover:shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="text-lg">{config.icon}</span>
      {loading ? 'Starting...' : config.label}
    </button>
  );
};

export default function PhaseControlButtons({
  session,
  onStateChange,
  onRefresh,
  compact = false,
  className = '',
}) {
  const [stateConfig, setStateConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // Load state configuration
  useEffect(() => {
    const fetchStateConfig = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/sessions/${session.id}/state-config`);
        if (response.data.success) {
          setStateConfig(response.data);
        }
      } catch (err) {
        console.error('Error fetching state config:', err);
        setError('Failed to load session state');
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) {
      fetchStateConfig();
    }
  }, [session?.id, session?.state]);

  const handlePhaseTransition = async (phase) => {
    try {
      setActionLoading(phase);
      setError(null);

      let endpoint = '';
      if (phase === 'snatch') {
        if (session.state === 'snatch_active') {
          endpoint = `/sessions/${session.id}/transitions/complete-snatch`;
        } else {
          endpoint = `/sessions/${session.id}/transitions/start-snatch`;
        }
      } else {
        if (session.state === 'clean_jerk_active') {
          endpoint = `/sessions/${session.id}/transitions/complete-clean-jerk`;
        } else {
          endpoint = `/sessions/${session.id}/transitions/start-clean-jerk`;
        }
      }

      const response = await api.post(endpoint, {
        userId: localStorage.getItem('userId'),
      });

      if (response.data.success) {
        onStateChange && onStateChange(response.data);
        onRefresh && onRefresh();
      } else {
        setError(response.data.message || 'Failed to transition phase');
      }
    } catch (err) {
      console.error('Error transitioning phase:', err);
      setError(err.response?.data?.message || 'Failed to transition phase');
    } finally {
      setActionLoading(null);
    }
  };

  if (!stateConfig || loading) {
    return null;
  }

  const buttons = stateConfig.buttons || {};
  const lockedPhase = stateConfig.lockedPhase;

  // Determine phase states
  const snatchActive = session.state === 'snatch_active';
  const snatchComplete = session.state === 'snatch_complete' || session.state === 'clean_jerk_active' || session.state === 'complete';
  const cleanJerkActive = session.state === 'clean_jerk_active';

  // Determine if phases should be visible
  const canShowSnatch = ['active', 'snatch_active', 'snatch_complete', 'clean_jerk_active', 'complete'].includes(session.state);
  const canShowCleanJerk = ['snatch_complete', 'clean_jerk_active', 'complete'].includes(session.state);

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      {/* Error Message (if compact, skip) */}
      {error && !compact && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Snatch Phase Button */}
      {canShowSnatch && (
        <PhaseButton
          phase="snatch"
          enabled={buttons.start_snatch}
          isActive={snatchActive}
          isLocked={lockedPhase === 'snatch'}
          onClick={() => handlePhaseTransition('snatch')}
          loading={actionLoading === 'snatch'}
        />
      )}

      {/* Clean & Jerk Phase Button */}
      {canShowCleanJerk && (
        <PhaseButton
          phase="clean_jerk"
          enabled={buttons.start_clean_jerk}
          isActive={cleanJerkActive}
          isLocked={lockedPhase === 'clean_jerk'}
          onClick={() => handlePhaseTransition('clean_jerk')}
          loading={actionLoading === 'clean_jerk'}
        />
      )}

      {/* Info Text */}
      {lockedPhase && !compact && (
        <span className="text-xs text-amber-600 flex items-center gap-1">
          <span>🔒</span>
          {lockedPhase === 'snatch' ? 'Snatch locked' : 'C&J locked'}
        </span>
      )}
    </div>
  );
}
