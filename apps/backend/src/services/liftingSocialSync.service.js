import { supabase } from '../config/supabase.js';

const normalizeBaseUrl = (value) => (value || '').trim().replace(/\/+$/, '').replace(/\/api$/, '');

const parseSyncTargets = () => {
  // Preferred: explicit backend API URLs (comma-separated for failover)
  const configured = process.env.LIFTING_SOCIAL_BACKEND_URLS || process.env.LIFTING_SOCIAL_BACKEND_URL || process.env.LIFTING_SOCIAL_API_URL || '';
  const candidates = configured
    .split(',')
    .map((item) => normalizeBaseUrl(item))
    .filter(Boolean);

  if (candidates.length > 0) {
    return Array.from(new Set(candidates));
  }

  return ['http://localhost:5000'];
};

const SYNC_TARGETS = parseSyncTargets();
const API_KEY = process.env.SYNC_API_KEY || 'dev-key';
const SYNC_RETRY_ATTEMPTS = Number(process.env.SYNC_RETRY_ATTEMPTS || 3);
const SYNC_RETRY_DELAY_MS = Number(process.env.SYNC_RETRY_DELAY_MS || 300);

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

const resolveAttemptOutcome = (attempt) => {
  const raw = String(attempt?.result || '').toLowerCase().trim();
  if (raw && raw !== 'pending') return raw;

  const decisions = [attempt?.referee_left, attempt?.referee_center, attempt?.referee_right]
    .map((d) => String(d || '').toLowerCase().trim())
    .filter((d) => d === 'good' || d === 'no-lift');

  if (decisions.length < 2) {
    return raw || 'pending';
  }

  const goodVotes = decisions.filter((d) => d === 'good').length;
  const noLiftVotes = decisions.filter((d) => d === 'no-lift').length;

  if (goodVotes >= 2) return 'good';
  if (noLiftVotes >= 2) return 'no-lift';

  return raw || 'pending';
};

const getRefereeDecisionCode = (attempt) => {
  const refs = [attempt.referee_left, attempt.referee_center, attempt.referee_right].filter(Boolean);
  if (!refs.length) return null;
  return refs
    .map((d) => (d === 'good' ? 'W' : 'R'))
    .join('');
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const postToWebsite = async (path, method = 'POST', payload = null) => {
  for (const target of SYNC_TARGETS) {
    const url = `${target}${path}`;

    for (let attempt = 1; attempt <= SYNC_RETRY_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
          },
          body: payload ? JSON.stringify(payload) : undefined,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(
            `⚠️ Lifting Social sync failed [${method} ${url}] attempt ${attempt}/${SYNC_RETRY_ATTEMPTS}`,
            response.status,
            errorText
          );

          if (attempt < SYNC_RETRY_ATTEMPTS) {
            const backoffMs = SYNC_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
            await sleep(backoffMs);
            continue;
          }

          break;
        }

        return await response.json();
      } catch (error) {
        console.warn(
          `⚠️ Lifting Social sync error [${method} ${url}] attempt ${attempt}/${SYNC_RETRY_ATTEMPTS}`,
          error.message
        );

        if (attempt < SYNC_RETRY_ATTEMPTS) {
          const backoffMs = SYNC_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          await sleep(backoffMs);
          continue;
        }
      }
    }
  }

  console.warn(`❌ Lifting Social sync exhausted for path ${path} across all targets`);
  return null;
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

  const resolvedOutcome = resolveAttemptOutcome(attempt);

  const payload = {
    wl_competition_id: attempt.session.competition_id,
    wl_athlete_id: attempt.athlete?.registration_id || attempt.athlete_id,
    attempt_type: mapLiftTypeToWebsite(attempt.lift_type),
    attempt_number: attempt.attempt_number,
    weight: attempt.weight,
    result: mapDecisionToResult(resolvedOutcome),
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

export const syncSessionCatalogByCompetition = async (competitionId) => {
  if (!competitionId) return null;

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, name, session_number, group_number, status')
    .eq('competition_id', competitionId)
    .order('session_number', { ascending: true });

  return postToWebsite('/api/wl-system/sync/sessions', 'POST', {
    wl_competition_id: competitionId,
    sessions: sessions || [],
  });
};

export const syncSessionCatalogBySession = async (sessionId) => {
  const context = await getSessionContext(sessionId);
  if (!context) return null;

  return syncSessionCatalogByCompetition(context.wlCompetitionId);
};

export const syncAthleteStatus = async (athlete) => {
  if (!athlete) return null;

  let wlCompetitionId = null;
  if (athlete.session_id) {
    const context = await getSessionContext(athlete.session_id);
    wlCompetitionId = context?.wlCompetitionId || null;
  }

  return postToWebsite('/api/wl-system/sync/athlete-status', 'POST', {
    wl_competition_id: wlCompetitionId,
    wl_athlete_id: athlete.registration_id || athlete.id,
    is_dq: athlete.is_dq === true,
    lot_number: athlete.lot_number ?? athlete.start_number ?? null,
  });
};
