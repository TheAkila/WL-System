/**
 * Weight Change Service
 * Handles athlete weight change requests during competition
 * Implements IWF rules: +1kg minimum, no decreases, max 2 changes per lift
 */

import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase.js';

/**
 * Request a weight change for an athlete
 * @param {Object} params - Weight change parameters
 * @param {string} params.athleteId - UUID of the athlete
 * @param {string} params.sessionId - UUID of the session
 * @param {string} params.liftType - 'snatch' or 'clean_jerk'
 * @param {number} params.attemptNumber - Current attempt number (1-3)
 * @param {number} params.oldWeight - Current declared weight
 * @param {number} params.newWeight - New desired weight
 * @param {string} params.requestedBy - UUID of user making request
 * @param {string} params.notes - Optional notes
 * @returns {Promise<Object>} Created weight change request
 */
export async function requestWeightChange({
  athleteId,
  sessionId,
  liftType,
  attemptNumber,
  oldWeight,
  newWeight,
  requestedBy,
  notes = null
}) {
  // Validate IWF rules
  await validateWeightChange(athleteId, liftType, oldWeight, newWeight);

  // Create the weight change request
  const { data, error } = await supabase
    .from('weight_change_requests')
    .insert({
      athlete_id: athleteId,
      session_id: sessionId,
      lift_type: liftType,
      attempt_number: attemptNumber,
      old_weight: oldWeight,
      new_weight: newWeight,
      requested_by: requestedBy,
      approved: true, // Auto-approve for now (can add approval workflow later)
      notes
    })
    .select(`
      *,
      athlete:athletes(
        id,
        name,
        start_number,
        country_code,
        team:teams(name, logo_url)
      )
    `)
    .single();

  if (error) {
    console.error('Error creating weight change request:', error);
    throw new Error(`Failed to create weight change request: ${error.message}`);
  }

  return data;
}

/**
 * Validate weight change against IWF rules
 * @param {string} athleteId - UUID of the athlete
 * @param {string} liftType - 'snatch' or 'clean_jerk'
 * @param {number} oldWeight - Current declared weight
 * @param {number} newWeight - New desired weight
 * @throws {Error} If validation fails
 */
async function validateWeightChange(athleteId, liftType, oldWeight, newWeight) {
  // Rule 1: New weight must be higher than old weight
  if (newWeight <= oldWeight) {
    throw new Error('New weight must be higher than current weight (IWF rule: no decreases allowed)');
  }

  // Rule 2: Minimum increase of 1kg
  const increase = newWeight - oldWeight;
  if (increase < 1) {
    throw new Error('Weight increase must be at least 1kg (IWF rule)');
  }

  // Rule 3: Maximum 2 weight changes per lift type
  const { data: existingChanges, error } = await supabase
    .from('weight_change_requests')
    .select('id')
    .eq('athlete_id', athleteId)
    .eq('lift_type', liftType)
    .eq('approved', true);

  if (error) {
    console.error('Error checking existing weight changes:', error);
    throw new Error('Failed to validate weight change request');
  }

  if (existingChanges && existingChanges.length >= 2) {
    throw new Error('Maximum 2 weight changes allowed per lift type (IWF rule)');
  }

  return true;
}

/**
 * Get all weight changes for a session
 * @param {string} sessionId - UUID of the session
 * @param {string} liftType - Optional filter by lift type
 * @returns {Promise<Array>} Array of weight change requests
 */
export async function getWeightChanges(sessionId, liftType = null) {
  let query = supabase
    .from('weight_change_requests')
    .select(`
      *,
      athlete:athletes(
        id,
        name,
        start_number,
        country_code,
        team:teams(name, logo_url)
      ),
      requested_by_user:users!weight_change_requests_requested_by_fkey(
        id,
        username,
        full_name
      )
    `)
    .eq('session_id', sessionId)
    .order('requested_at', { ascending: false });

  if (liftType) {
    query = query.eq('lift_type', liftType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching weight changes:', error);
    throw new Error(`Failed to fetch weight changes: ${error.message}`);
  }

  return data || [];
}

/**
 * Get weight change count for an athlete
 * @param {string} athleteId - UUID of the athlete
 * @param {string} liftType - 'snatch' or 'clean_jerk'
 * @returns {Promise<number>} Number of approved weight changes
 */
export async function getWeightChangeCount(athleteId, liftType) {
  const { data, error } = await supabase
    .from('weight_change_requests')
    .select('id')
    .eq('athlete_id', athleteId)
    .eq('lift_type', liftType)
    .eq('approved', true);

  if (error) {
    console.error('Error counting weight changes:', error);
    return 0;
  }

  return data ? data.length : 0;
}

/**
 * Get the current effective weight for an athlete's next attempt
 * Returns the most recent weight change or the original opening attempt
 * @param {string} athleteId - UUID of the athlete
 * @param {string} liftType - 'snatch' or 'clean_jerk'
 * @returns {Promise<number|null>} Current effective weight or null
 */
export async function getCurrentEffectiveWeight(athleteId, liftType) {
  // Check for most recent weight change
  const { data: weightChange, error: changeError } = await supabase
    .from('weight_change_requests')
    .select('new_weight')
    .eq('athlete_id', athleteId)
    .eq('lift_type', liftType)
    .eq('approved', true)
    .order('requested_at', { ascending: false })
    .limit(1)
    .single();

  if (!changeError && weightChange) {
    return weightChange.new_weight;
  }

  // No weight change found, get opening attempt
  const { data: athlete, error: athleteError } = await supabase
    .from('athletes')
    .select(liftType === 'snatch' ? 'opening_snatch' : 'opening_clean_jerk')
    .eq('id', athleteId)
    .single();

  if (athleteError || !athlete) {
    return null;
  }

  return liftType === 'snatch' ? athlete.opening_snatch : athlete.opening_clean_jerk;
}

/**
 * Cancel a weight change request (mark as not approved)
 * @param {string} weightChangeId - UUID of the weight change request
 * @returns {Promise<Object>} Updated weight change request
 */
export async function cancelWeightChange(weightChangeId) {
  const { data, error } = await supabase
    .from('weight_change_requests')
    .update({ approved: false })
    .eq('id', weightChangeId)
    .select()
    .single();

  if (error) {
    console.error('Error canceling weight change:', error);
    throw new Error(`Failed to cancel weight change: ${error.message}`);
  }

  return data;
}

/**
 * Get weight changes for a specific athlete
 * @param {string} athleteId - UUID of the athlete
 * @param {string} liftType - Optional filter by lift type
 * @returns {Promise<Array>} Array of weight change requests
 */
export async function getAthleteWeightChanges(athleteId, liftType = null) {
  let query = supabase
    .from('weight_change_requests')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('requested_at', { ascending: false });

  if (liftType) {
    query = query.eq('lift_type', liftType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching athlete weight changes:', error);
    throw new Error(`Failed to fetch athlete weight changes: ${error.message}`);
  }

  return data || [];
}

export default {
  requestWeightChange,
  validateWeightChange,
  getWeightChanges,
  getWeightChangeCount,
  getCurrentEffectiveWeight,
  cancelWeightChange,
  getAthleteWeightChanges
};
