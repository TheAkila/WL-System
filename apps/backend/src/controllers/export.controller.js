const { supabase } = require('../config/supabase.js');
const { AppError } = require('../middleware/errorHandler.js');
const {
  generateProtocolPDF, generateLeaderboardCSV, generateStartListCSV, cleanupTempFile,
} = require('../services/exportService.js');

/**
 * Export session protocol as PDF
 */
const exportProtocolPDF = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        *,
        competition:competitions(name)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new AppError('Session not found', 404);
    }

    // Get leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('athlete_rankings')
      .select('*')
      .eq('session_id', sessionId)
      .order('rank', { ascending: true });

    if (leaderboardError) {
      throw new AppError('Failed to fetch results', 500);
    }

    // Add competition name to session
    session.competition_name = session.competition?.name;

    // Generate PDF
    const pdfBuffer = await generateProtocolPDF(session, [], leaderboard);

    // Set response headers
    const filename = `protocol_${session.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Export leaderboard as CSV
 */
const exportLeaderboardCSV = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('name')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new AppError('Session not found', 404);
    }

    // Get leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('athlete_rankings')
      .select('*')
      .eq('session_id', sessionId)
      .order('rank', { ascending: true });

    if (leaderboardError) {
      throw new AppError('Failed to fetch leaderboard', 500);
    }

    // Generate CSV
    const { filepath, filename } = await generateLeaderboardCSV(leaderboard, session.name);

    // Send file
    res.download(filepath, filename, async (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Cleanup temp file
      await cleanupTempFile(filepath);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export start list as CSV
 */
const exportStartListCSV = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('name')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new AppError('Session not found', 404);
    }

    // Get athletes
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select(`
        *,
        team:teams(name)
      `)
      .eq('session_id', sessionId)
      .order('start_number', { ascending: true });

    if (athletesError) {
      throw new AppError('Failed to fetch athletes', 500);
    }

    // Add team names
    const athletesWithTeams = athletes.map(a => ({
      ...a,
      team_name: a.team?.name || '',
    }));

    // Generate CSV
    const { filepath, filename } = await generateStartListCSV(athletesWithTeams, session.name);

    // Send file
    res.download(filepath, filename, async (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      await cleanupTempFile(filepath);
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export competition results (all sessions) as PDF
 */
const exportCompetitionPDF = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    // Get competition details
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('id', competitionId)
      .single();

    if (compError || !competition) {
      throw new AppError('Competition not found', 404);
    }

    // Get all sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('competition_id', competitionId)
      .order('date', { ascending: true });

    if (sessionsError) {
      throw new AppError('Failed to fetch sessions', 500);
    }

    // For now, return first session (can be expanded later)
    if (sessions.length === 0) {
      throw new AppError('No sessions found for this competition', 404);
    }

    // Get results for first session
    const { data: leaderboard } = await supabase
      .from('athlete_rankings')
      .select('*')
      .eq('session_id', sessions[0].id)
      .order('rank', { ascending: true });

    const sessionData = { ...sessions[0], competition_name: competition.name };
    const pdfBuffer = await generateProtocolPDF(sessionData, [], leaderboard || []);

    const filename = `results_${competition.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
module.exports = { exportProtocolPDF,exportLeaderboardCSV,exportStartListCSV,exportCompetitionPDF };
