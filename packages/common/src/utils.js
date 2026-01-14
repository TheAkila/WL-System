/**
 * Format weight for display
 * @param {number} weight - Weight in kg
 * @returns {string} Formatted weight
 */
export const formatWeight = (weight) => {
  return `${weight} kg`;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format time for display
 * @param {Date|string} time - Time to format
 * @returns {string} Formatted time
 */
export const formatTime = (time) => {
  const t = new Date(time);
  return t.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate total from snatch and clean & jerk
 * @param {number} snatch - Snatch weight
 * @param {number} cleanAndJerk - Clean & jerk weight
 * @returns {number} Total weight
 */
export const calculateTotal = (snatch, cleanAndJerk) => {
  return (snatch || 0) + (cleanAndJerk || 0);
};

/**
 * Get sinclair coefficient for a given body weight and gender
 * @param {number} bodyWeight - Athlete's body weight
 * @param {'male'|'female'} gender - Athlete's gender
 * @returns {number} Sinclair coefficient
 */
export const getSinclairCoefficient = (bodyWeight, gender) => {
  // Sinclair coefficients (2024 IWF)
  const constants = {
    male: { a: 0.794358, b: 175.508 },
    female: { a: 0.897260, b: 153.757 },
  };

  const { a, b } = constants[gender] || constants.male;
  
  if (bodyWeight >= b) return 1;
  
  const exponent = a * Math.pow(Math.log10(bodyWeight / b), 2);
  return Math.pow(10, exponent);
};

/**
 * Calculate Sinclair total
 * @param {number} total - Total weight lifted
 * @param {number} bodyWeight - Athlete's body weight
 * @param {'male'|'female'} gender - Athlete's gender
 * @returns {number} Sinclair total
 */
export const calculateSinclairTotal = (total, bodyWeight, gender) => {
  const coefficient = getSinclairCoefficient(bodyWeight, gender);
  return total * coefficient;
};

/**
 * Validate attempt based on referee decisions
 * @param {Object} decisions - Referee decisions
 * @param {string} decisions.left - Left referee decision
 * @param {string} decisions.center - Center referee decision
 * @param {string} decisions.right - Right referee decision
 * @returns {'good'|'no-lift'|'pending'} Attempt result
 */
export const validateAttempt = ({ left, center, right }) => {
  if (!left || !center || !right) {
    return 'pending';
  }

  const goodCount = [left, center, right].filter((d) => d === 'good').length;
  return goodCount >= 2 ? 'good' : 'no-lift';
};

/**
 * Sort athletes by ranking
 * @param {Array} athletes - Array of athletes with totals
 * @returns {Array} Sorted athletes
 */
export const sortByRanking = (athletes) => {
  return [...athletes].sort((a, b) => {
    // Sort by total (descending)
    if (b.total !== a.total) {
      return b.total - a.total;
    }
    // If totals are equal, sort by body weight (ascending)
    return a.bodyWeight - b.bodyWeight;
  });
};

/**
 * Get attempt display text
 * @param {number} attemptNumber - Attempt number (1-3)
 * @param {'snatch'|'cleanAndJerk'} liftType - Type of lift
 * @returns {string} Display text
 */
export const getAttemptDisplay = (attemptNumber, liftType) => {
  const liftName = liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk';
  return `${liftName} - Attempt ${attemptNumber}/3`;
};
