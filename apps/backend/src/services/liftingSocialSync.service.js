import { supabase } from '../config/supabase.js';

const BASE_URL = process.env.LIFTING_SOCIAL_API_URL || 'http://localhost:3001';
const API_KEY = process.env.SYNC_API_KEY || 'dev-key';

const mapStatusToWebsite = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized === 'in-progress' || normalized === 'in_progress' || normalized === 'active') {
    return 'in_progress';
  }
  if (normalized === 'completed' || normalized === 'complete' || normalized === 'finished') {
    return 'completed';
  }
  if (normalized === 'scheduled' || normalized === 'ready_to_start' || normalized === 'weighing') {
    return 'scheduled';
  }
  return 'scheduled';
};

const mapLiftTypeToWebsite = (liftType) => {
  if (liftType === 'clean_and_jerk') return 'clean_jerk';
  return liftType || 'snatch';
};

const mapDecisionToResult = (decision) => {
  if (decision === 'good') return 'good_lift';
  if (decision === 'no-lift') return 'no_lift';
  return decision || 'no_lift';
};

const getRefereeDecisionCode = (attempt) => {
  const refs = [attempt.referee_left, attempt.referee_center, attempt.referee_right].filter(Boolean);
  if (!refs.length) return null;
  return refs
    .map((d) => (d === 'good' ? 'W' : 'R'))
    .join('');
};

const postToWebsite = async (path, method = 'POST', payload = null) => {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ Lifting Social sync failed [${method} ${path}]`, response.status, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`⚠️ Lifting Social sync error [${method} ${path}]`, error.message);
    return null;
  }
};

const getSessionContext = async (sessionId) => {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, competition_id, session_number, group_number, current_lift, status')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return null;
  }

  const { data: competition } = await supabase
    .from('competitions')
    .select('id')
    .eq('id', session.competition_id)
    .single();

  if (!competition) return null;

  return {
    session,
    wlCompetitionId: competition.id,
  };
};

const getPendingAttempts = async (sessionId) => {
  const { data } = await supabase
    .from('attempts')
    .select('id, athlete_id, lift_type, attempt_number, weight, timestamp, athlete:athletes(id, name, registration_id)')
    .eq('session_id', sessionId)
    .eq('result', 'pending')
    .order('timestamp', { ascending: false });

  return data || [];
};

export const syncCompetitionStatusBySession = async (sessionId, status) => {
  const context = await getSessionContext(sessionId);
  if (!context) return null;

  const competition_status = mapStatusToWebsite(status);
  return postToWebsite(
    `/api/wl-system/sync/competition/${context.wlCompetitionId}/status`,
    'PATCH',
    { competition_status }
  );
};

export const syncLiveStateFromSession = async (sessionId, timerData = {}) => {
  const context = await getSessionContext(sessionId);
  if (!context) return null;

  const pendingAttempts = await getPendingAttempts(sessionId);
  const currentAttempt = pendingAttempts[0] || null;
  const nextAttempt = pendingAttempts[1] || null;

  const payload = {
    wl_competition_id: context.wlCompetitionId,
    current_session: context.session.session_number || 1,
    current_group: context.session.group_number || 'A',
    current_lift_type: mapLiftTypeToWebsite(currentAttempt?.lift_type || context.session.current_lift || 'snatch'),
    current_athlete_wl_id: currentAttempt?.athlete?.registration_id || currentAttempt?.athlete_id || null,
    current_athlete_name: currentAttempt?.athlete?.name || null,
    current_attempt_number: currentAttempt?.attempt_number || null,
    current_weight: currentAttempt?.weight || null,
    timer_running: !!timerData.running,
    timer_remaining: timerData.remaining ?? null,
    referee_decisions: timerData.referee_decisions || null,
    next_athlete_wl_id: nextAttempt?.athlete?.registration_id || nextAttempt?.athlete_id || null,
    next_athlete_name: nextAttempt?.athlete?.name || null,
    next_weight: nextAttempt?.weight || null,
    lifting_order: pendingAttempts.map((a) => ({
      athlete_id: a.athlete_id,
      athlete_name: a.athlete?.name,
      weight: a.weight,
      lift_type: mapLiftTypeToWebsite(a.lift_type),
      attempt_number: a.attempt_number,
    })),
  };

  return postToWebsite('/api/wl-system/sync/live-state', 'POST', payload);
};

export const syncLiveResult = async (attempt) => {
  if (!attempt?.session?.competition_id || !attempt?.athlete_id) return null;

  const payload = {
    wl_competition_id: attempt.session.competition_id,
    wl_athlete_id: attempt.athlete?.registration_id || attempt.athlete_id,
    attempt_type: mapLiftTypeToWebsite(attempt.lift_type),
    attempt_number: attempt.attempt_number,
    weight: attempt.weight,
    result: mapDecisionToResult(attempt.result),
    referee_decision: getRefereeDecisionCode(attempt),
    timestamp: attempt.timestamp || new Date().toISOString(),
  };

  return postToWebsite('/api/wl-system/sync/results/live', 'POST', payload);
};

export const syncFinalResultsForSession = async (sessionId) => {
  const context = await getSessionContext(sessionId);
  if (!context) return null;

  const { data: athletes } = await supabase
    .from('athletes')
    .select('id, registration_id, best_snatch, best_clean_and_jerk, total, sinclair_total, rank, medal')
    .eq('session_id', sessionId)
    .order('rank', { ascending: true });

  const results = (athletes || []).map((athlete) => ({
    wl_athlete_id: athlete.registration_id || athlete.id,
    best_snatch: athlete.best_snatch || 0,
    best_clean_jerk: athlete.best_clean_and_jerk || 0,
    total: athlete.total || 0,
    sinclair_score: athlete.sinclair_total || 0,
    category_rank: athlete.rank || null,
    overall_rank: athlete.rank || null,
    session_rank: athlete.rank || null,
    medals: {
      gold: athlete.medal === 'gold',
      silver: athlete.medal === 'silver',
      bronze: athlete.medal === 'bronze',
    },
    records_broken: [],
    awards: [],
  }));

  return postToWebsite('/api/wl-system/sync/results/final', 'POST', {
    wl_competition_id: context.wlCompetitionId,
    results,
  });
};
