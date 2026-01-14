// Competition status
export const COMPETITION_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Session status
export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Lift types
export const LIFT_TYPES = {
  SNATCH: 'snatch',
  CLEAN_AND_JERK: 'cleanAndJerk',
};

// Attempt results
export const ATTEMPT_RESULTS = {
  PENDING: 'pending',
  GOOD: 'good',
  NO_LIFT: 'no-lift',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  TECHNICAL: 'technical',
  REFEREE: 'referee',
  VIEWER: 'viewer',
};

// Gender
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
};

// Weight categories (Olympic weightlifting)
export const WEIGHT_CATEGORIES = {
  MALE: ['55', '61', '67', '73', '81', '89', '96', '102', '109', '+109'],
  FEMALE: ['45', '49', '55', '59', '64', '71', '76', '81', '87', '+87'],
};

// Record types
export const RECORD_TYPES = {
  NONE: 'none',
  NATIONAL: 'national',
  CONTINENTAL: 'continental',
  WORLD: 'world',
};

// Socket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Rooms
  JOIN_COMPETITION: 'join:competition',
  LEAVE_COMPETITION: 'leave:competition',
  JOIN_SESSION: 'join:session',
  LEAVE_SESSION: 'leave:session',
  
  // Competitions
  COMPETITION_UPDATED: 'competition:updated',
  
  // Sessions
  SESSION_STARTED: 'session:started',
  SESSION_UPDATED: 'session:updated',
  SESSION_ENDED: 'session:ended',
  
  // Attempts
  ATTEMPT_CREATED: 'attempt:created',
  ATTEMPT_UPDATED: 'attempt:updated',
  ATTEMPT_VALIDATED: 'attempt:validated',
  
  // Leaderboard
  LEADERBOARD_UPDATED: 'leaderboard:updated',
  
  // Timer
  TIMER_START: 'timer:start',
  TIMER_STARTED: 'timer:started',
  TIMER_PAUSE: 'timer:pause',
  TIMER_PAUSED: 'timer:paused',
  TIMER_RESET: 'timer:reset',
};

// Timer durations (in seconds)
export const TIMER_DURATIONS = {
  ATTEMPT: 60,
  BREAK: 120,
};
