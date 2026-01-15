import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with service role key (for backend only)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create client with anon key (for frontend)
export const supabaseAnon = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || ''
);

/**
 * Database service wrapper for Supabase operations
 */
class DatabaseService {
  // Expose the supabase client for direct access when needed
  supabase = supabase;

  // =====================================================
  // COMPETITIONS
  // =====================================================

  async getCompetitions() {
    const { data, error } = await supabase
      .from('competitions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getCompetition(id) {
    const { data, error } = await supabase
      .from('competitions')
      .select('*, sessions(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createCompetition(competition) {
    const { data, error } = await supabase
      .from('competitions')
      .insert(competition)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCompetition(id, updates) {
    const { data, error } = await supabase
      .from('competitions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCompetition(id) {
    const { error } = await supabase.from('competitions').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // =====================================================
  // SESSIONS
  // =====================================================

  async getSessions(competitionId = null) {
    let query = supabase
      .from('sessions')
      .select('*, competition:competitions(*), athletes(*)');

    if (competitionId) {
      query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getSession(id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, competition:competitions(*), athletes(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createSession(session) {
    const { data, error } = await supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSession(id, updates) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async startSession(id) {
    return this.updateSession(id, {
      status: 'in-progress',
      start_time: new Date().toISOString(),
    });
  }

  async endSession(id) {
    return this.updateSession(id, {
      status: 'completed',
      end_time: new Date().toISOString(),
    });
  }

  // =====================================================
  // ATHLETES
  // =====================================================

  async getAthletes(sessionId = null) {
    let query = supabase
      .from('athletes')
      .select('*, session:sessions(*), team:teams(*)');

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('start_number', { ascending: true });

    if (error) throw error;
    return data;
  }

  async getAthlete(id) {
    const { data, error } = await supabase
      .from('athletes')
      .select('*, session:sessions(*), team:teams(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAthlete(athlete) {
    const { data, error } = await supabase
      .from('athletes')
      .insert(athlete)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAthlete(id, updates) {
    const { data, error } = await supabase
      .from('athletes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAthlete(id) {
    const { error } = await supabase.from('athletes').delete().eq('id', id);

    if (error) throw error;
    return { success: true };
  }

  // =====================================================
  // ATTEMPTS
  // =====================================================

  async getAttempts(filters = {}) {
    let query = supabase
      .from('attempts')
      .select('*, athlete:athletes(*), session:sessions(*)');

    if (filters.athleteId) {
      query = query.eq('athlete_id', filters.athleteId);
    }
    if (filters.sessionId) {
      query = query.eq('session_id', filters.sessionId);
    }
    if (filters.liftType) {
      query = query.eq('lift_type', filters.liftType);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createAttempt(attempt) {
    const { data, error } = await supabase
      .from('attempts')
      .insert(attempt)
      .select('*, athlete:athletes(*), session:sessions(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async updateAttempt(id, updates) {
    const { data, error } = await supabase
      .from('attempts')
      .update(updates)
      .eq('id', id)
      .select('*, athlete:athletes(*), session:sessions(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async recordRefereeDecision(attemptId, position, decision) {
    const field = `referee_${position}`;
    const { data, error } = await supabase
      .from('attempts')
      .update({ [field]: decision })
      .eq('id', attemptId)
      .select('*, athlete:athletes(*), session:sessions(*)')
      .single();

    if (error) throw error;
    return data;
  }

  async declareAttempt(athleteId, weight) {
    const { data, error } = await supabase.rpc('declare_attempt', {
      p_athlete_id: athleteId,
      p_weight: weight,
    });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // LEADERBOARD & RANKINGS
  // =====================================================

  async getLeaderboard(sessionId = null) {
    let query = supabase.from('leaderboard').select('*');

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query.order('rank', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateRankings(sessionId) {
    const { error } = await supabase.rpc('update_session_rankings', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    return { success: true };
  }

  async getLiftingOrder(sessionId) {
    const { data, error } = await supabase.rpc('get_lifting_order', {
      p_session_id: sessionId,
    });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // TEAMS
  // =====================================================

  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createTeam(team) {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTeamStandings(competitionId = null) {
    let query = supabase.from('team_standings').select('*');

    if (competitionId) {
      query = query.eq('competition_id', competitionId);
    }

    const { data, error } = await query.order('team_total', { ascending: false });

    if (error) throw error;
    return data;
  }

  // =====================================================
  // REALTIME SUBSCRIPTIONS
  // =====================================================

  subscribeToAttempts(callback) {
    return supabase
      .channel('attempts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attempts' }, callback)
      .subscribe();
  }

  subscribeToAthletes(callback) {
    return supabase
      .channel('athletes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'athletes' }, callback)
      .subscribe();
  }

  subscribeToSessions(callback) {
    return supabase
      .channel('sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, callback)
      .subscribe();
  }
}

export const db = new DatabaseService();
export default db;
