/**
 * TypeScript-style JSDoc type definitions
 * Can be used with JSDoc or converted to .d.ts files
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} name
 * @property {string} email
 * @property {'admin'|'technical'|'referee'|'viewer'} role
 * @property {boolean} isActive
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Competition
 * @property {string} _id
 * @property {string} name
 * @property {Date} date
 * @property {string} location
 * @property {string} [organizer]
 * @property {string} [description]
 * @property {'upcoming'|'active'|'completed'|'cancelled'} status
 * @property {string[]} sessions
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Athlete
 * @property {string} _id
 * @property {string} name
 * @property {string} country
 * @property {Date} [birthDate]
 * @property {'male'|'female'} gender
 * @property {string} weightCategory
 * @property {number} [bodyWeight]
 * @property {string} [teamOrClub]
 * @property {number} [startNumber]
 * @property {string[]} sessions
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} Session
 * @property {string} _id
 * @property {string} competition
 * @property {string} name
 * @property {string} weightCategory
 * @property {'male'|'female'} gender
 * @property {Date} [startTime]
 * @property {Date} [endTime]
 * @property {'scheduled'|'in-progress'|'completed'|'cancelled'} status
 * @property {'snatch'|'cleanAndJerk'} currentLift
 * @property {string[]} athletes
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {Object} RefereeDecisions
 * @property {'good'|'no-lift'|null} left
 * @property {'good'|'no-lift'|null} center
 * @property {'good'|'no-lift'|null} right
 */

/**
 * @typedef {Object} Attempt
 * @property {string} _id
 * @property {string} athlete
 * @property {string} session
 * @property {'snatch'|'cleanAndJerk'} liftType
 * @property {number} attemptNumber
 * @property {number} weight
 * @property {'pending'|'good'|'no-lift'} result
 * @property {RefereeDecisions} refereeDecisions
 * @property {Date} timestamp
 * @property {'none'|'national'|'continental'|'world'} recordType
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export {};
