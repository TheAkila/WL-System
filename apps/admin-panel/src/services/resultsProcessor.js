/**
 * Results Processor Service
 * Handles automatic calculation of:
 * - Best lifts (snatch, C&J)
 * - Totals
 * - Sinclair scores
 * - Ranking with tie-breaking
 * - Medal assignment
 */

export class ResultsProcessor {
  /**
   * Calculate best snatch from attempts
   */
  static calculateBestSnatch(attempts) {
    const snatches = attempts.filter(a => a.lift_type === 'snatch' && a.result === 'good');
    if (snatches.length === 0) return 0;
    return Math.max(...snatches.map(a => a.weight));
  }

  /**
   * Calculate best clean & jerk from attempts
   */
  static calculateBestCleanAndJerk(attempts) {
    const cj = attempts.filter(a => a.lift_type === 'clean_and_jerk' && a.result === 'good');
    if (cj.length === 0) return 0;
    return Math.max(...cj.map(a => a.weight));
  }

  /**
   * Calculate total (snatch + C&J)
   */
  static calculateTotal(bestSnatch, bestCleanAndJerk) {
    return bestSnatch + bestCleanAndJerk;
  }

  /**
   * Calculate Sinclair Score
   * Formula: (total / world_record) ^ 2 * 1000
   * For women and men, uses different world records
   */
  static calculateSinclairScore(total, gender, bodyWeight) {
    // Sinclair world records (approximate)
    const worldRecords = {
      male: 500,    // kg (adjusted based on gender)
      female: 340,  // kg
    };

    const wr = worldRecords[gender.toLowerCase()] || 500;
    const sinclair = (total / wr) ** 2 * 1000;
    return Math.round(sinclair * 100) / 100;
  }

  /**
   * Rank athletes with tie-breaking rules
   * Primary: Total (descending)
   * Secondary: Body weight (ascending - lighter wins)
   * Tertiary: Start number (ascending - lower wins)
   */
  static rankAthletes(athletes) {
    return athletes
      .sort((a, b) => {
        // Primary: Total descending
        if (b.total !== a.total) {
          return b.total - a.total;
        }

        // Secondary: Body weight ascending
        if (a.body_weight !== b.body_weight) {
          return a.body_weight - b.body_weight;
        }

        // Tertiary: Start number ascending
        return a.start_number - b.start_number;
      })
      .map((athlete, index) => ({
        ...athlete,
        rank: index + 1,
      }));
  }

  /**
   * Assign medals based on ranking
   */
  static assignMedals(rankedAthletes) {
    return rankedAthletes.map(athlete => ({
      ...athlete,
      medal: 
        athlete.rank === 1 ? 'gold' :
        athlete.rank === 2 ? 'silver' :
        athlete.rank === 3 ? 'bronze' :
        null,
    }));
  }

  /**
   * Process session results
   * Recalculates all athlete scores, rankings, and medals
   */
  static processSessionResults(athletes, attempts) {
    // Calculate scores for each athlete
    const athletesWithScores = athletes.map(athlete => {
      const athleteAttempts = attempts.filter(a => a.athlete_id === athlete.id);
      
      const bestSnatch = this.calculateBestSnatch(athleteAttempts);
      const bestCleanAndJerk = this.calculateBestCleanAndJerk(athleteAttempts);
      const total = this.calculateTotal(bestSnatch, bestCleanAndJerk);
      const sinclairScore = this.calculateSinclairScore(total, athlete.gender, athlete.body_weight);

      return {
        ...athlete,
        best_snatch: bestSnatch,
        best_clean_and_jerk: bestCleanAndJerk,
        total,
        sinclair_total: sinclairScore,
      };
    });

    // Rank athletes
    const rankedAthletes = this.rankAthletes(athletesWithScores);

    // Assign medals
    const athletesWithMedals = this.assignMedals(rankedAthletes);

    return athletesWithMedals;
  }

  /**
   * Generate session summary
   */
  static generateSessionSummary(session, rankedAthletes) {
    const medals = {
      gold: rankedAthletes.find(a => a.medal === 'gold'),
      silver: rankedAthletes.find(a => a.medal === 'silver'),
      bronze: rankedAthletes.find(a => a.medal === 'bronze'),
    };

    return {
      session: {
        id: session.id,
        name: session.name,
        category: session.weight_category,
        gender: session.gender,
      },
      statistics: {
        totalAthletes: rankedAthletes.length,
        completedAthletes: rankedAthletes.filter(a => a.total > 0).length,
        averageTotal: Math.round(
          rankedAthletes.reduce((sum, a) => sum + a.total, 0) / rankedAthletes.length
        ),
        highestTotal: Math.max(...rankedAthletes.map(a => a.total)),
      },
      medals,
      topPerformers: rankedAthletes.slice(0, 5),
    };
  }

  /**
   * Generate competition results report
   */
  static generateCompetitionReport(competitions, sessions) {
    const allMedals = {
      gold: [],
      silver: [],
      bronze: [],
    };

    const sessionSummaries = sessions.map(session => {
      const sessionAthletes = competitions.filter(c => c.session_id === session.id);
      return this.generateSessionSummary(session, sessionAthletes);
    });

    return {
      totalSessions: sessions.length,
      totalAthletes: competitions.length,
      sessionSummaries,
      allMedals,
    };
  }
}

export default ResultsProcessor;
