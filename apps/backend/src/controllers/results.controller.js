import db from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Process session results and calculate rankings
 */
export const processSessionResults = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Fetch session
    const { data: session, error: sessionError } = await db.supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw new AppError('Session not found', 404);

    // Fetch all athletes in session
    const { data: athletes, error: athletesError } = await db.supabase
      .from('athletes')
      .select('*')
      .eq('session_id', sessionId);

    if (athletesError) throw athletesError;

    // Fetch all attempts
    const { data: attempts, error: attemptsError } = await db.supabase
      .from('attempts')
      .select('*')
      .eq('session_id', sessionId);

    if (attemptsError) throw attemptsError;

    // Process results
    const processedAthletes = athletes.map(athlete => {
      const athleteAttempts = attempts.filter(a => a.athlete_id === athlete.id);
      
      // Calculate best snatch
      const snatches = athleteAttempts.filter(a => a.lift_type === 'snatch' && a.result === 'good');
      const bestSnatch = snatches.length > 0 ? Math.max(...snatches.map(a => a.weight)) : 0;
      
      // Calculate best C&J
      const cj = athleteAttempts.filter(a => a.lift_type === 'clean_and_jerk' && a.result === 'good');
      const bestCleanAndJerk = cj.length > 0 ? Math.max(...cj.map(a => a.weight)) : 0;
      
      // Calculate total
      const total = bestSnatch + bestCleanAndJerk;
      
      // Calculate Sinclair score
      const wr = athlete.gender === 'male' ? 500 : 340;
      const sinclairTotal = (total / wr) ** 2 * 1000;

      return {
        ...athlete,
        best_snatch: bestSnatch,
        best_clean_and_jerk: bestCleanAndJerk,
        total,
        sinclair_total: sinclairTotal,
      };
    });

    // Rank athletes
    const rankedAthletes = processedAthletes
      .sort((a, b) => {
        // Primary: Total descending
        if (b.total !== a.total) return b.total - a.total;
        // Secondary: Body weight ascending
        if (a.body_weight !== b.body_weight) return a.body_weight - b.body_weight;
        // Tertiary: Start number ascending
        return a.start_number - b.start_number;
      })
      .map((athlete, index) => ({
        ...athlete,
        rank: index + 1,
        medal: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : null,
      }));

    // Update athletes with final results
    for (const athlete of rankedAthletes) {
      const { error } = await db.supabase
        .from('athletes')
        .update({
          best_snatch: athlete.best_snatch,
          best_clean_and_jerk: athlete.best_clean_and_jerk,
          total: athlete.total,
          sinclair_total: athlete.sinclair_total,
          rank: athlete.rank,
          medal: athlete.medal,
          total_completed_at: new Date().toISOString(),
        })
        .eq('id', athlete.id);

      if (error) throw error;
    }

    res.status(200).json({
      success: true,
      data: {
        session,
        results: rankedAthletes,
        statistics: {
          totalAthletes: rankedAthletes.length,
          averageTotal: Math.round(
            rankedAthletes.reduce((sum, a) => sum + a.total, 0) / rankedAthletes.length
          ),
          highestTotal: Math.max(...rankedAthletes.map(a => a.total)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session results
 */
export const getSessionResults = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const { data: athletes, error } = await db.supabase
      .from('athletes')
      .select('*')
      .eq('session_id', sessionId)
      .order('rank', { ascending: true });

    if (error) throw error;

    const medals = {
      gold: athletes.find(a => a.medal === 'gold'),
      silver: athletes.find(a => a.medal === 'silver'),
      bronze: athletes.find(a => a.medal === 'bronze'),
    };

    res.status(200).json({
      success: true,
      data: {
        athletes,
        medals,
        summary: {
          totalAthletes: athletes.length,
          averageTotal: Math.round(
            athletes.reduce((sum, a) => sum + a.total, 0) / athletes.length
          ),
          highestTotal: Math.max(...athletes.map(a => a.total)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get competition results (all sessions)
 */
export const getCompetitionResults = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    // Get all sessions for competition
    const { data: sessions, error: sessionsError } = await db.supabase
      .from('sessions')
      .select('*')
      .eq('competition_id', competitionId);

    if (sessionsError) throw sessionsError;

    // Get all athletes for each session
    const sessionResults = await Promise.all(
      sessions.map(async (session) => {
        const { data: athletes } = await db.supabase
          .from('athletes')
          .select('*')
          .eq('session_id', session.id)
          .order('rank', { ascending: true });

        const medals = {
          gold: athletes?.find(a => a.medal === 'gold'),
          silver: athletes?.find(a => a.medal === 'silver'),
          bronze: athletes?.find(a => a.medal === 'bronze'),
        };

        return {
          session,
          athletes: athletes || [],
          medals,
        };
      })
    );

    // Get all medals across competition
    const allAthletes = sessionResults.flatMap(sr => sr.athletes);
    const allMedals = {
      gold: allAthletes.filter(a => a.medal === 'gold'),
      silver: allAthletes.filter(a => a.medal === 'silver'),
      bronze: allAthletes.filter(a => a.medal === 'bronze'),
    };

    res.status(200).json({
      success: true,
      data: {
        sessionResults,
        allMedals,
        summary: {
          totalSessions: sessions.length,
          totalAthletes: allAthletes.length,
          totalGoldMedals: allMedals.gold.length,
          totalSilverMedals: allMedals.silver.length,
          totalBronzeMedals: allMedals.bronze.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  processSessionResults,
  getSessionResults,
  getCompetitionResults,
};
