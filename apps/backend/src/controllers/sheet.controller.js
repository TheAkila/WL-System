import { supabase } from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Get sheet data with all athletes and their attempts - OPTIMIZED
export const getSessionSheet = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get all athletes with attempts in a single optimized query
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select('*, team:teams(country), attempts(*)')
      .eq('session_id', sessionId)
      .order('start_number', { ascending: true });

    if (athletesError) throw new AppError(athletesError.message, 400);

    // Process attempts into snatch and clean_jerk groups
    const athletesWithProcessedAttempts = (athletes || []).map((athlete) => {
      let attempts = athlete.attempts || [];
      
      // Create automatic attempts from opening weights if they don't exist
      // and the athlete has completed weigh-in
      if (athlete.weigh_in_completed_at) {
        // Snatch attempt 1 from opening_snatch
        if (athlete.opening_snatch && !attempts.find(a => a.lift_type === 'snatch' && a.attempt_number === 1)) {
          attempts.push({
            id: `opening_snatch_${athlete.id}`,
            athlete_id: athlete.id,
            lift_type: 'snatch',
            attempt_number: 1,
            weight: athlete.opening_snatch,
            result: 'pending',
            is_opening: true,
            created_at: new Date().toISOString()
          });
        }

        // Clean & Jerk attempt 1 from opening_clean_jerk
        if (athlete.opening_clean_jerk && !attempts.find(a => a.lift_type === 'clean_and_jerk' && a.attempt_number === 1)) {
          attempts.push({
            id: `opening_cj_${athlete.id}`,
            athlete_id: athlete.id,
            lift_type: 'clean_and_jerk',
            attempt_number: 1,
            weight: athlete.opening_clean_jerk,
            result: 'pending',
            is_opening: true,
            created_at: new Date().toISOString()
          });
        }
      }
      
      const snatch_attempts = attempts
        .filter(a => a.lift_type === 'snatch')
        .sort((a, b) => a.attempt_number - b.attempt_number);
      
      const clean_jerk_attempts = attempts
        .filter(a => a.lift_type === 'clean_and_jerk')
        .sort((a, b) => a.attempt_number - b.attempt_number);

      return {
        id: athlete.id,
        name: athlete.name,
        country: athlete.country,
        gender: athlete.gender,
        weight_category: athlete.weight_category,
        body_weight: athlete.body_weight,
        start_number: athlete.start_number,
        is_dq: athlete.is_dq,
        weigh_in_completed_at: athlete.weigh_in_completed_at,
        opening_snatch: athlete.opening_snatch,
        opening_clean_jerk: athlete.opening_clean_jerk,
        teams: athlete.team, // Properly name the team object
        snatch_attempts,
        clean_jerk_attempts,
      };
    });

    res.status(200).json({
      success: true,
      data: athletesWithProcessedAttempts,
    });
  } catch (error) {
    next(error);
  }
};

// Update or create an attempt
export const updateSheetAttempt = async (req, res, next) => {
  try {
    const { athlete_id, session_id, lift_type, attempt_number, weight, result } = req.body;

    console.log('📝 updateSheetAttempt called:', { athlete_id, session_id, lift_type, attempt_number, weight, result });

    if (!athlete_id || !session_id || !lift_type || !attempt_number) {
      console.error('❌ Missing required fields:', { athlete_id, session_id, lift_type, attempt_number });
      throw new AppError('Missing required fields', 400);
    }

    // Check if attempt already exists
    const { data: existing, error: checkError } = await supabase
      .from('attempts')
      .select('*')
      .eq('athlete_id', athlete_id)
      .eq('lift_type', lift_type)
      .eq('attempt_number', attempt_number)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing attempt:', checkError);
      throw new AppError(checkError.message, 400);
    }

    let attemptData;

    if (existing) {
      console.log('🔄 Updating existing attempt:', existing.id);
      // IWF Rule: Check if edit count exceeds maximum (3 tries allowed: 1st, 2nd, 3rd)
      const currentEditCount = existing.edit_count || 1;
      if (currentEditCount > 3) {
        throw new AppError('Maximum 3 tries allowed per attempt. Cannot modify further.', 400);
      }

      // IWF Rule: Validate progressive weight (new attempt must be >= previous successful attempt)
      if (attempt_number > 1 && weight) {
        // Get previous attempt for this lift
        const { data: previousAttempt, error: prevError } = await supabase
          .from('attempts')
          .select('weight, result')
          .eq('athlete_id', athlete_id)
          .eq('lift_type', lift_type)
          .eq('attempt_number', attempt_number - 1)
          .single();

        if (prevError && prevError.code !== 'PGRST116') {
          throw new AppError(prevError.message, 400);
        }

        // If previous attempt was successful, enforce weight progression
        if (previousAttempt && previousAttempt.result === 'good' && previousAttempt.weight) {
          if (weight < previousAttempt.weight) {
            throw new AppError(
              `Attempt weight (${weight}kg) must be ≥ previous attempt (${previousAttempt.weight}kg). IWF Rule: Each subsequent attempt must be same or heavier.`,
              400
            );
          }
        }
      }

      // Update existing attempt and increment edit count
      const { data, error } = await supabase
        .from('attempts')
        .update({
          weight,
          result,
          edit_count: currentEditCount + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating attempt:', error);
        throw new AppError(error.message, 400);
      }
      attemptData = data;
      console.log('✅ Attempt updated successfully:', attemptData);
    } else {
      console.log('➕ Creating new attempt');
      // Create new attempt with edit_count = 1 (initial entry counts as 1st try)
      const { data, error } = await supabase
        .from('attempts')
        .insert([{
          athlete_id,
          session_id,
          lift_type,
          attempt_number,
          weight,
          result,
          edit_count: 1,
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating attempt:', error);
        throw new AppError(error.message, 400);
      }
      attemptData = data;
      console.log('✅ Attempt created successfully:', attemptData);
    }

    res.status(200).json({
      success: true,
      data: attemptData,
    });
  } catch (error) {
    console.error('🔴 updateSheetAttempt error:', error.message);
    next(error);
  }
};
