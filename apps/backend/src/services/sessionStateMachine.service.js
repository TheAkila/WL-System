/**
 * Session State Machine Service
 * Manages all state transitions and business logic for sessions
 * Implements the optimized competition workflow
 * Uses Supabase for database operations
 */

import { supabase } from '../config/supabase.js';

export class SessionStateMachine {
  /**
   * State machine configuration
   * Defines valid transitions and button availability
   */
  static STATE_CONFIG = {
    scheduled: {
      canTransitionTo: ['weighing', 'postponed'],
      buttons: {
        weigh_in: true,
        start_competition: false,
        start_snatch: false,
        start_clean_jerk: false,
      },
      description: 'Not started yet',
      lockedPhase: null,
    },
    postponed: {
      canTransitionTo: ['scheduled'],
      buttons: {
        weigh_in: true,
        start_competition: false,
        start_snatch: false,
        start_clean_jerk: false,
      },
      description: 'Session postponed',
      lockedPhase: null,
    },
    weighing: {
      canTransitionTo: ['ready_to_start', 'scheduled'],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: false,
        start_clean_jerk: false,
      },
      description: 'Weigh-in in progress',
      lockedPhase: null,
    },
    ready_to_start: {
      canTransitionTo: ['active', 'weighing'],
      buttons: {
        weigh_in: false,
        start_competition: true, // ✅ COMPETITION BUTTON ENABLED
        start_snatch: false,
        start_clean_jerk: false,
      },
      description: 'Ready to start competition',
      lockedPhase: null,
    },
    active: {
      canTransitionTo: ['snatch_active'],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: true, // ✅ SNATCH ENABLED
        start_clean_jerk: false, // ❌ C&J LOCKED
      },
      description: 'Deciding which phase to start',
      lockedPhase: 'clean_jerk',
    },
    snatch_active: {
      canTransitionTo: ['snatch_complete'],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: false, // ❌ LOCKED
        start_clean_jerk: false, // ❌ LOCKED
      },
      description: 'Snatch phase active',
      lockedPhase: 'clean_jerk',
    },
    snatch_complete: {
      canTransitionTo: ['clean_jerk_active'],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: false, // ❌ LOCKED
        start_clean_jerk: true, // ✅ C&J ENABLED
      },
      description: 'Snatch complete, ready for C&J',
      lockedPhase: 'snatch',
    },
    clean_jerk_active: {
      canTransitionTo: ['complete'],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: false, // ❌ LOCKED
        start_clean_jerk: false, // ❌ LOCKED
      },
      description: 'Clean & Jerk phase active',
      lockedPhase: 'snatch',
    },
    complete: {
      canTransitionTo: [],
      buttons: {
        weigh_in: false,
        start_competition: false,
        start_snatch: false,
        start_clean_jerk: false,
      },
      description: 'Competition finished',
      lockedPhase: null,
    },
  };

  /**
   * Validate if a state transition is allowed
   */
  static isValidTransition(fromState, toState) {
    const config = this.STATE_CONFIG[fromState];
    if (!config) return false;
    return config.canTransitionTo.includes(toState);
  }

  /**
   * Get button configuration for a state
   */
  static getButtonConfig(state) {
    return this.STATE_CONFIG[state]?.buttons || {};
  }

  /**
   * Transition session to a new state
   */
  static async transitionSession(sessionId, newState, userId = null, reason = null) {
    try {
      const { data, error } = await supabase.rpc('update_session_state', {
        p_session_id: sessionId,
        p_new_state: newState,
        p_user_id: userId,
        p_reason: reason,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('Failed to update session state');
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start weigh-in process
   * scheduled → weighing
   */
  static async startWeighIn(sessionId, userId = null) {
    try {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('state')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error('Session not found');
      }

      const currentState = sessionData.state;

      // Validate transition
      if (!this.isValidTransition(currentState, 'weighing')) {
        throw new Error(
          `Cannot start weigh-in from state: ${currentState}`
        );
      }

      return await this.transitionSession(
        sessionId,
        'weighing',
        userId,
        'Admin started weigh-in'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete weigh-in process
   * weighing → ready_to_start
   */
  static async completeWeighIn(sessionId, userId = null) {
    try {
      // Verify all athletes are weighed in
      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('id, weighed_in')
        .eq('session_id', sessionId);

      if (athletesError) {
        throw new Error('Failed to fetch athletes');
      }

      if (athletes.length === 0) {
        throw new Error('No athletes in session');
      }

      const weighed_in = athletes.filter(a => a.weighed_in).length;

      if (weighed_in < athletes.length) {
        throw new Error(
          `Not all athletes weighed in: ${weighed_in}/${athletes.length}`
        );
      }

      return await this.transitionSession(
        sessionId,
        'ready_to_start',
        userId,
        `All ${athletes.length} athletes weighed in`
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start competition
   * ready_to_start → active
   */
  static async startCompetition(sessionId, userId = null) {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('state')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error('Session not found');
      }

      const currentState = sessionData.state;

      if (currentState !== 'ready_to_start') {
        throw new Error(`Cannot start competition from state: ${currentState}`);
      }

      return await this.transitionSession(
        sessionId,
        'active',
        userId,
        'Admin started competition'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start snatch phase
   * active/snatch_complete → snatch_active
   */
  static async startSnatchPhase(sessionId, userId = null) {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('state')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error('Session not found');
      }

      const currentState = sessionData.state;

      if (!['active', 'snatch_complete'].includes(currentState)) {
        throw new Error(`Cannot start snatch from state: ${currentState}`);
      }

      return await this.transitionSession(
        sessionId,
        'snatch_active',
        userId,
        'Admin started snatch phase'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete snatch phase
   * snatch_active → snatch_complete
   */
  static async completeSnatchPhase(sessionId, userId = null) {
    try {
      // Verify all lifters have completed snatch
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select('athlete_id, result')
        .eq('lift_type', 'snatch');

      if (attemptsError) {
        throw new Error('Failed to fetch attempts');
      }

      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('is_dq', false);

      if (athletesError) {
        throw new Error('Failed to fetch athletes');
      }

      if (athletes.length === 0) {
        throw new Error('No active lifters in session');
      }

      const athleteIds = athletes.map(a => a.id);
      const completedAthletes = new Set();

      for (const athleteId of athleteIds) {
        const athleteAttempts = attempts.filter(a => a.athlete_id === athleteId);
        const hasAllComplete = athleteAttempts.some(a => a.result !== 'pending');
        if (hasAllComplete) {
          completedAthletes.add(athleteId);
        }
      }

      if (completedAthletes.size < athleteIds.length) {
        throw new Error(
          `Not all lifters completed snatch: ${completedAthletes.size}/${athleteIds.length}`
        );
      }

      return await this.transitionSession(
        sessionId,
        'snatch_complete',
        userId,
        'All athletes completed snatch phase'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Start clean & jerk phase
   * snatch_complete → clean_jerk_active
   */
  static async startCleanJerkPhase(sessionId, userId = null) {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('state')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error('Session not found');
      }

      const currentState = sessionData.state;

      if (currentState !== 'snatch_complete') {
        throw new Error(
          `Cannot start C&J from state: ${currentState}. Must complete snatch first.`
        );
      }

      return await this.transitionSession(
        sessionId,
        'clean_jerk_active',
        userId,
        'Admin started clean & jerk phase'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Complete clean & jerk phase
   * clean_jerk_active → complete
   */
  static async completeCleanJerkPhase(sessionId, userId = null) {
    try {
      // Verify all lifters have completed C&J
      const { data: attempts, error: attemptsError } = await supabase
        .from('attempts')
        .select('athlete_id, result')
        .eq('lift_type', 'clean_and_jerk');

      if (attemptsError) {
        throw new Error('Failed to fetch attempts');
      }

      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('is_dq', false);

      if (athletesError) {
        throw new Error('Failed to fetch athletes');
      }

      if (athletes.length === 0) {
        throw new Error('No active lifters in session');
      }

      const athleteIds = athletes.map(a => a.id);
      const completedAthletes = new Set();

      for (const athleteId of athleteIds) {
        const athleteAttempts = attempts.filter(a => a.athlete_id === athleteId);
        const hasAllComplete = athleteAttempts.some(a => a.result !== 'pending');
        if (hasAllComplete) {
          completedAthletes.add(athleteId);
        }
      }

      if (completedAthletes.size < athleteIds.length) {
        throw new Error(
          `Not all lifters completed C&J: ${completedAthletes.size}/${athleteIds.length}`
        );
      }

      return await this.transitionSession(
        sessionId,
        'complete',
        userId,
        'All athletes completed competition'
      );
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get weigh-in summary
   */
  static async getWeighInSummary(sessionId) {
    try {
      const { data, error } = await supabase.rpc('get_weigh_in_summary', {
        p_session_id: sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data[0],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Mark athlete as weighed in
   */
  static async markAthleteWeighedIn(
    athleteId,
    bodyWeightKg,
    startWeightKg = null
  ) {
    try {
      const { data, error } = await supabase.rpc('mark_athlete_weighed_in', {
        p_athlete_id: athleteId,
        p_body_weight_kg: bodyWeightKg,
        p_start_weight_kg: startWeightKg,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get next lifter for current phase
   */
  static async getNextLifter(sessionId, phase) {
    try {
      if (!['snatch', 'clean_jerk'].includes(phase)) {
        throw new Error('Invalid phase. Must be snatch or clean_jerk');
      }

      const { data, error } = await supabase.rpc('get_next_lifter', {
        p_session_id: sessionId,
        p_phase: phase,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          data: null,
          message: 'No more lifters',
        };
      }

      return {
        success: true,
        data: data[0],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get session state configuration
   */
  static async getSessionStateConfig(sessionId) {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          id,
          state,
          current_phase,
          locked_phase,
          weigh_in_completed_at,
          snatch_started_at,
          snatch_completed_at,
          clean_jerk_started_at,
          clean_jerk_completed_at
        `)
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        throw new Error('Session not found');
      }

      const buttonConfig = this.getButtonConfig(sessionData.state);

      return {
        success: true,
        data: {
          ...sessionData,
          buttons: buttonConfig,
          stateDescription: this.STATE_CONFIG[sessionData.state].description,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get session state history
   */
  static async getSessionStateHistory(sessionId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('session_state_history')
        .select(`
          id,
          from_state,
          to_state,
          reason,
          changed_by,
          created_at
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default SessionStateMachine;
