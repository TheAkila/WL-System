/**
 * AttemptCell Enhancement for Phase 2
 * 
 * This file shows the enhancements needed to AttemptCell to support
 * highlighting the target weight cell during active competition
 * 
 * Add this to your existing AttemptCell component:
 */

// 1. Add this import at the top
// import { useSessionState } from '../../context/SessionStateContext';

// 2. Add this hook inside the AttemptCell component (after other hooks)
/*
  const { nextLifter } = useSessionState();
  
  // Determine if this cell is the target weight cell
  const isTargetCell = nextLifter &&
    nextLifter.athlete_id === athlete.id &&
    nextLifter.target_weight === weight &&
    attemptNumber === nextLifter.current_attempt;
*/

// 3. Update the cell className to include the highlighting:
/*
  const cellClasses = `
    relative p-2 border text-center font-semibold
    transition-all duration-300 cursor-pointer
    ${isTargetCell 
      ? 'bg-yellow-300 ring-2 ring-yellow-500 shadow-lg scale-105' 
      : 'hover:bg-gray-100'
    }
    ${result === 'good' ? 'bg-green-100' : ''}
    ${result === 'no_lift' ? 'bg-red-100' : ''}
    ${result === 'pending' ? 'bg-white' : ''}
  `;
*/

// 4. Add a visual indicator for target cell:
/*
  return (
    <div className={cellClasses}>
      {isTargetCell && (
        <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          🎯
        </div>
      )}
      {/* existing cell content */}
    </div>
  );
*/

// ====================================================================
// SIMPLER ALTERNATIVE: Add this as a separate highlight component
// ====================================================================

import React from 'react';
import api from '../../config/api';

/**
 * AttemptCellHighlighter - Simpler approach
 * Wraps around AttemptCell to add highlighting without modifying the original
 */

export const AttemptCellHighlighter = ({
  athlete,
  attemptType,
  attemptNumber,
  children, // The AttemptCell component
  session,
}) => {
  const [nextLifter, setNextLifter] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // Fetch next lifter info when session state changes
  React.useEffect(() => {
    const fetchNextLifter = async () => {
      try {
        if (!session || !['snatch_active', 'clean_jerk_active'].includes(session.state)) {
          setNextLifter(null);
          return;
        }

        setLoading(true);
        const phase = session.state === 'snatch_active' ? 'snatch' : 'clean_jerk';
        
        const response = await api.get(`/sessions/${session.id}/next-lifter?phase=${phase}`);
        if (response.data.success) {
          setNextLifter(response.data);
        }
      } catch (err) {
        console.error('Error fetching next lifter:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.state) {
      fetchNextLifter();
    }
  }, [session?.state, session?.id]);

  // Determine if this is the target cell
  const attempt = athlete?.attempts?.find(
    a => a.lift_type === attemptType && a.attempt_number === attemptNumber
  );

  const isTargetCell = !loading && nextLifter &&
    nextLifter.athlete_id === athlete.id &&
    nextLifter.target_weight === (attempt?.weight || attempt?.requested_weight) &&
    attemptNumber === nextLifter.current_attempt;

  return (
    <div className={`relative ${isTargetCell ? 'ring-2 ring-yellow-400 rounded' : ''}`}>
      {isTargetCell && (
        <div className="absolute -top-3 -right-3 bg-yellow-400 text-black text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10 animate-bounce">
          🎯
        </div>
      )}
      {children}
    </div>
  );
};

// ====================================================================
// CONTEXT APPROACH: Session State Context for sharing nextLifter
// ====================================================================

// Create this file: /apps/admin-panel/src/context/SessionStateContext.jsx

export const SessionStateContextCode = `
import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../config/api';

const SessionStateContext = createContext();

export const useSessionState = () => {
  const context = useContext(SessionStateContext);
  if (!context) {
    throw new Error('useSessionState must be used within SessionStateProvider');
  }
  return context;
};

export const SessionStateProvider = ({ session, children }) => {
  const [nextLifter, setNextLifter] = useState(null);
  const [sessionStateConfig, setSessionStateConfig] = useState(null);
  const [weighInSummary, setWeighInSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch next lifter when session state changes
  useEffect(() => {
    const fetchNextLifter = async () => {
      try {
        if (!session || !['snatch_active', 'clean_jerk_active'].includes(session.state)) {
          setNextLifter(null);
          return;
        }

        const phase = session.state === 'snatch_active' ? 'snatch' : 'clean_jerk';
        const response = await api.get(\`/sessions/\${session.id}/next-lifter?phase=\${phase}\`);
        
        if (response.data.success) {
          setNextLifter(response.data);
        }
      } catch (err) {
        console.error('Error fetching next lifter:', err);
        setError(err.message);
      }
    };

    if (session?.id) {
      fetchNextLifter();
    }
  }, [session?.id, session?.state]);

  // Fetch state configuration
  useEffect(() => {
    const fetchStateConfig = async () => {
      try {
        setLoading(true);
        const response = await api.get(\`/sessions/\${session.id}/state-config\`);
        
        if (response.data.success) {
          setSessionStateConfig(response.data);
        }
      } catch (err) {
        console.error('Error fetching state config:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) {
      fetchStateConfig();
    }
  }, [session?.id, session?.state]);

  // Fetch weigh-in summary when in weighing state
  useEffect(() => {
    const fetchWeighInSummary = async () => {
      try {
        if (session?.state !== 'weighing') {
          setWeighInSummary(null);
          return;
        }

        const response = await api.get(\`/sessions/\${session.id}/weigh-in-summary\`);
        
        if (response.data.success) {
          setWeighInSummary(response.data);
        }
      } catch (err) {
        console.error('Error fetching weigh-in summary:', err);
      }
    };

    if (session?.id) {
      fetchWeighInSummary();
    }
  }, [session?.id, session?.state]);

  const value = {
    nextLifter,
    sessionStateConfig,
    weighInSummary,
    loading,
    error,
  };

  return (
    <SessionStateContext.Provider value={value}>
      {children}
    </SessionStateContext.Provider>
  );
};
`;

// ====================================================================
// USAGE INSTRUCTIONS
// ====================================================================

export const UsageInstructions = `
OPTION 1: Simple Highlight without Context
============================================
Import and wrap AttemptCell:

import { AttemptCellHighlighter } from '../components/technical/AttemptCellHighlight';

<AttemptCellHighlighter
  session={session}
  athlete={athlete}
  attemptType="snatch"
  attemptNumber={1}
>
  <AttemptCell
    athlete={athlete}
    attemptType="snatch"
    attemptNumber={1}
    onUpdate={handleUpdate}
  />
</AttemptCellHighlighter>

OPTION 2: Using Context (Recommended for large apps)
=====================================================
1. Create SessionStateContext.jsx file with code provided above
2. Wrap your session view with provider:

<SessionStateProvider session={session}>
  <YourSessionView />
</SessionStateProvider>

3. In AttemptCell, add highlighting:

import { useSessionState } from '../context/SessionStateContext';

const AttemptCell = ({ athlete, attemptType, attemptNumber, ... }) => {
  const { nextLifter } = useSessionState();
  
  const isTargetCell = nextLifter &&
    nextLifter.athlete_id === athlete.id &&
    nextLifter.target_weight === weight &&
    attemptNumber === nextLifter.current_attempt;

  return (
    <div className={isTargetCell ? 'bg-yellow-300 ring-2 ring-yellow-500' : ''}>
      {isTargetCell && <div className="absolute -top-2 -right-2">🎯</div>}
      {/* cell content */}
    </div>
  );
};

OPTION 3: Modify Existing AttemptCell.jsx
==========================================
Add at the top after imports:
import api from '../../config/api';

Inside component, after other useState hooks:
const [nextLifter, setNextLifter] = useState(null);

Add this useEffect:
useEffect(() => {
  const fetchNextLifter = async () => {
    try {
      if (!session || !['snatch_active', 'clean_jerk_active'].includes(session.state)) {
        setNextLifter(null);
        return;
      }
      const phase = session.state === 'snatch_active' ? 'snatch' : 'clean_jerk';
      const response = await api.get(\`/sessions/\${session.id}/next-lifter?phase=\${phase}\`);
      if (response.data.success) {
        setNextLifter(response.data);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };
  if (session?.id) fetchNextLifter();
}, [session?.id, session?.state]);

In the return JSX, update the main cell div:
const isTargetCell = nextLifter &&
  nextLifter.athlete_id === athlete.id &&
  nextLifter.target_weight === weight &&
  attemptNumber === nextLifter.current_attempt;

const cellClasses = \`
  relative p-2 border text-center font-semibold
  transition-all duration-300 cursor-pointer
  \${isTargetCell ? 'bg-yellow-300 ring-2 ring-yellow-500 shadow-lg scale-105' : 'hover:bg-gray-100'}
  \${result === 'good' ? 'bg-green-100' : ''}
  \${result === 'no_lift' ? 'bg-red-100' : ''}
  \${result === 'pending' ? 'bg-white' : ''}
\`;

return (
  <div className={cellClasses}>
    {isTargetCell && (
      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        🎯
      </div>
    )}
    {/* existing content */}
  </div>
);
`;

export default {
  AttemptCellHighlighter,
  SessionStateContextCode,
  UsageInstructions,
};
