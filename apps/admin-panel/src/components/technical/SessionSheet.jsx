import { useState, useEffect, useCallback } from 'react';
import { Printer, Download, RefreshCw, ArrowLeft, Timer, Check, Trash2, Unlock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AttemptCell from './AttemptCell';
import socketService from '../../services/socket';
import CompetitionTimer from './CompetitionTimer';

export default function SessionSheet({ session: initialSession, onBack }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [session, setSession] = useState(initialSession);
  const [error, setError] = useState(null);
  const [lastUpdateSource, setLastUpdateSource] = useState(null);
  const [nextLifter, setNextLifter] = useState(null);
  const [previousLifter, setPreviousLifter] = useState(null); // Track previous lifter for timer duration
  const [timerDuration, setTimerDuration] = useState(60); // IWF: 60s or 120s
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerKey, setTimerKey] = useState(0); // Force timer reset
  const [forceEditMode, setForceEditMode] = useState(false); // Force edit mode to bypass restrictions

  const sessionId = session?.id;

  // Calculate best lifts and totals for each athlete
  const calculateResults = (athletesData) => {
    return athletesData.map(athlete => {
      const snatchAttempts = athlete.attempts?.filter(a => a.lift_type === 'snatch') || [];
      const cjAttempts = athlete.attempts?.filter(a => a.lift_type === 'clean_and_jerk') || [];

      const goodSnatch = snatchAttempts.filter(a => a.result === 'good');
      const goodCJ = cjAttempts.filter(a => a.result === 'good');

      const bestSnatch = goodSnatch.length > 0 
        ? Math.max(...goodSnatch.map(a => a.weight || a.requested_weight || 0))
        : 0;
      
      const bestCleanJerk = goodCJ.length > 0
        ? Math.max(...goodCJ.map(a => a.weight || a.requested_weight || 0))
        : 0;

      const total = (bestSnatch > 0 && bestCleanJerk > 0) ? bestSnatch + bestCleanJerk : 0;

      return {
        ...athlete,
        bestSnatch,
        bestCleanJerk,
        total,
        is_dq: athlete.is_dq || false
      };
    });
  };

  // Calculate rankings
  const calculateRankings = (athletesData) => {
    const withResults = calculateResults(athletesData);
    
    // Separate DQ athletes
    const activeAthletes = withResults.filter(a => !a.is_dq);
    const dqAthletes = withResults.filter(a => a.is_dq);

    // Sort active athletes by total (desc), then bodyweight (asc), then start number (asc)
    const ranked = activeAthletes
      .sort((a, b) => {
        if (a.total !== b.total) return b.total - a.total;
        if (a.bodyweight !== b.bodyweight) return a.bodyweight - b.bodyweight;
        return (a.start_number || 0) - (b.start_number || 0);
      })
      .map((athlete, index) => ({
        ...athlete,
        rank: athlete.total > 0 ? index + 1 : null
      }));

    // DQ athletes have no rank
    const dqWithNoRank = dqAthletes.map(athlete => ({
      ...athlete,
      rank: null
    }));

    return [...ranked, ...dqWithNoRank];
  };

  // Calculate next lifter based on IWF rules
  const calculateNextLifter = useCallback((athletesData) => {
    if (!athletesData || athletesData.length === 0) return null;

    const activeAthletes = athletesData.filter(a => !a.is_dq);
    if (activeAthletes.length === 0) return null;

    // Collect all pending attempts with their details
    const pendingAttempts = [];

    activeAthletes.forEach(athlete => {
      // Check snatch attempts (1, 2, 3)
      let hasSnatchPending = false;
      for (let attemptNum = 1; attemptNum <= 3; attemptNum++) {
        const snatchAttempt = athlete.attempts?.find(
          a => a.lift_type === 'snatch' && a.attempt_number === attemptNum
        );
        
        // If attempt doesn't exist or is pending, it's next for this athlete
        if (!snatchAttempt || snatchAttempt.result === 'pending') {
          const weight = snatchAttempt?.weight || snatchAttempt?.requested_weight || athlete.opening_snatch || 0;
          if (weight > 0) {
            pendingAttempts.push({
              athlete,
              liftType: 'snatch',
              attemptNumber: attemptNum,
              weight,
              displayName: athlete.name || 'Unknown'
            });
            hasSnatchPending = true;
          }
          break; // Only consider the first pending attempt for this lift type
        }
      }

      // Check clean & jerk attempts (1, 2, 3) - only if no pending snatch attempts
      if (!hasSnatchPending) {
        for (let attemptNum = 1; attemptNum <= 3; attemptNum++) {
          const cjAttempt = athlete.attempts?.find(
            a => a.lift_type === 'clean_and_jerk' && a.attempt_number === attemptNum
          );
          
          if (!cjAttempt || cjAttempt.result === 'pending') {
            const weight = cjAttempt?.weight || cjAttempt?.requested_weight || athlete.opening_clean_jerk || 0;
            if (weight > 0) {
              pendingAttempts.push({
                athlete,
                liftType: 'clean_and_jerk',
                attemptNumber: attemptNum,
                weight,
                displayName: athlete.name || 'Unknown'
              });
            }
            break;
          }
        }
      }
    });

    if (pendingAttempts.length === 0) return null;

    // Sort by IWF rules:
    // 1. Snatch before Clean & Jerk
    // 2. Lower weight first (ascending)
    // 3. Lower attempt number first
    // 4. Lower start number first (tie-breaker)
    pendingAttempts.sort((a, b) => {
      // Snatch comes before C&J
      if (a.liftType !== b.liftType) {
        return a.liftType === 'snatch' ? -1 : 1;
      }
      // Lower weight first
      if (a.weight !== b.weight) {
        return a.weight - b.weight;
      }
      // Lower attempt number first
      if (a.attemptNumber !== b.attemptNumber) {
        return a.attemptNumber - b.attemptNumber;
      }
      // Lower start number first (tie-breaker)
      return (a.athlete.start_number || 0) - (b.athlete.start_number || 0);
    });

    return pendingAttempts[0];
  }, []);

  // Update timer when next lifter changes (IWF Rules)
  useEffect(() => {
    if (nextLifter) {
      // IWF Rule 6.6.3 & 6.6.4:
      // - 60 seconds for first attempt or when switching athletes
      // - 120 seconds for consecutive attempts by same athlete
      let duration = 60;
      
      if (previousLifter && previousLifter.athlete.id === nextLifter.athlete.id) {
        // Same athlete, consecutive attempt
        duration = 120;
      }
      
      setTimerDuration(duration);
      setTimerKey(prev => prev + 1); // Reset timer
      setTimerRunning(false); // Don't auto-start, official will start manually
      
      // Update previous lifter
      setPreviousLifter(nextLifter);
    }
  }, [nextLifter, previousLifter]);

  // Load session data
  const fetchSessionData = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching session data for sessionId:', sessionId);
      
      const response = await api.get(`/technical/sessions/${sessionId}/sheet`);
      
      // Handle API response format: {success: true, data: [...athletes]}
      let athletesData = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        athletesData = response.data.data;
      } else if (Array.isArray(response.data.athletes)) {
        athletesData = response.data.athletes;
      } else if (Array.isArray(response.data)) {
        athletesData = response.data;
      }
      
      // Validate that we got data - if empty, keep existing data
      if (!athletesData || athletesData.length === 0) {
        console.warn('⚠️ API returned empty athletes data, keeping existing data');
        setLoading(false);
        return;
      }
      
      // Transform snatch_attempts and clean_jerk_attempts to attempts array
      const transformedAthletes = athletesData.map(athlete => {
        const attempts = [];
        
        // Add snatch attempts
        if (Array.isArray(athlete.snatch_attempts)) {
          attempts.push(...athlete.snatch_attempts.map(a => ({
            ...a,
            lift_type: 'snatch'
          })));
        }
        
        // Add clean & jerk attempts
        if (Array.isArray(athlete.clean_jerk_attempts)) {
          attempts.push(...athlete.clean_jerk_attempts.map(a => ({
            ...a,
            lift_type: 'clean_and_jerk'
          })));
        }
        
        return {
          ...athlete,
          attempts: attempts
        };
      });
      
      console.log('📊 Athletes loaded:', transformedAthletes.length);
      
      const withCalculations = calculateRankings(transformedAthletes);
      setAthletes(withCalculations);
      
      // Calculate initial next lifter
      const next = calculateNextLifter(withCalculations);
      setNextLifter(next);
      
    } catch (error) {
      console.error('❌ Error fetching session data:', error);
      setError(error.message || 'Failed to load session data');
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Handle attempt update (from AttemptCell)
  const handleAttemptUpdate = async (attemptData) => {
    try {
      console.log('💾 Updating attempt:', attemptData);
      setSaving(true);

      // Optimistic update
      const updatedAthletes = athletes.map(athlete => {
        if (athlete.id === attemptData.athlete_id) {
          const updatedAttempts = athlete.attempts?.map(a => {
            if (a.lift_type === attemptData.lift_type && 
                a.attempt_number === attemptData.attempt_number) {
              return { ...a, ...attemptData };
            }
            return a;
          }) || [];

          // If attempt doesn't exist, add it
          const attemptExists = updatedAttempts.some(
            a => a.lift_type === attemptData.lift_type && 
                 a.attempt_number === attemptData.attempt_number
          );

          if (!attemptExists) {
            updatedAttempts.push({
              ...attemptData,
              athlete_id: athlete.id,
              session_id: sessionId
            });
          }

          return {
            ...athlete,
            attempts: updatedAttempts
          };
        }
        return athlete;
      });

      const rankedAthletes = calculateRankings(updatedAthletes);
      setAthletes(rankedAthletes);
      
      // Update next lifter after data entry
      const next = calculateNextLifter(rankedAthletes);
      setNextLifter(next);

      // IMMEDIATE save to backend (no delay to prevent data loss)
      try {
        const payload = {
          athlete_id: attemptData.athlete_id,
          session_id: sessionId,
          lift_type: attemptData.lift_type,
          attempt_number: attemptData.attempt_number,
          weight: attemptData.weight || attemptData.requested_weight,
          result: attemptData.result || 'pending'
        };

        console.log('📡 Sending to backend immediately:', payload);
        setSaving(true);

        if (attemptData.id) {
          // Update existing attempt
          const response = await api.put(`/attempts/${attemptData.id}`, payload);
          console.log('✅ Attempt updated:', response.data);
          setLastSaved(new Date());
          toast.success('✓ Saved');
        } else {
          // Create new attempt
          const response = await api.post('/attempts', payload);
          console.log('✅ Attempt created:', response.data);
          setLastSaved(new Date());
          toast.success('✓ Saved');
        }
        
        // Emit socket update to notify other users (but not ourselves)
        socketService.emit('sheet:update', {
          sessionId,
          athleteId: attemptData.athlete_id,
          liftType: attemptData.lift_type,
          attemptNumber: attemptData.attempt_number,
          source: 'self' // Mark as our own update
        });
        
      } catch (error) {
        console.error('❌ Error saving attempt:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.message);
        toast.error('⚠️ Failed to save - ' + (error.response?.data?.message || error.message || 'Retry'));
        // DO NOT refresh - data is already optimistically updated
      } finally {
        setSaving(false);
      }

      // Clear any pending timeout
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout);

    } catch (error) {
      console.error('❌ Error updating attempt:', error);
      toast.error('Failed to update attempt');
      setSaving(false);
    }
  };

  // Handle DQ toggle
  const handleDQToggle = async (athleteId, isDQ) => {
    try {
      console.log('🚫 Updating DQ status:', { athleteId, isDQ });
      
      // Optimistic update
      const updatedAthletes = athletes.map(a => 
        a.id === athleteId ? { ...a, is_dq: isDQ } : a
      );
      setAthletes(calculateRankings(updatedAthletes));
      
      // Save to backend
      const response = await api.put(`/athletes/${athleteId}`, { is_dq: isDQ });
      console.log('✅ DQ status updated:', response.data);
      
      toast.success(isDQ ? 'Athlete disqualified' : 'DQ removed');
    } catch (error) {
      console.error('❌ Error updating DQ status:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update DQ status');
      // DO NOT refresh - data is already optimistically updated, user should retry manually
    }
  };

  // Effects
  useEffect(() => {
    if (sessionId) {
      fetchSessionData();
    }
  }, [sessionId]);

  // NOTE: Socket listeners DISABLED to prevent data loss from auto-refresh
  // Data is already optimistically updated on client side
  // Manual refresh button available in UI if sync needed

  const handlePrint = () => {
    window.print();
  };

  const handleExport = async () => {
    try {
      const exportData = {
        session: {
          id: sessionId,
          name: session?.name,
          current_lift: session?.current_lift
        },
        athletes: athletes.map(a => ({
          name: a.name,
          team: a.teams?.country || a.country,
          bodyweight: a.bodyweight,
          snatch: [1, 2, 3].map(num => {
            const attempt = a.attempts?.find(at => at.lift_type === 'snatch' && at.attempt_number === num);
            return {
              weight: attempt?.requested_weight || '-',
              result: attempt?.result || '-'
            };
          }),
          cleanJerk: [1, 2, 3].map(num => {
            const attempt = a.attempts?.find(at => at.lift_type === 'clean_and_jerk' && at.attempt_number === num);
            return {
              weight: attempt?.requested_weight || '-',
              result: attempt?.result || '-'
            };
          }),
          bestSnatch: a.bestSnatch || 0,
          bestCleanJerk: a.bestCleanJerk || 0,
          total: a.total || 0,
          rank: a.rank || '-',
          dq: a.is_dq
        })),
        timestamp: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session-${sessionId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Session data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export session data');
    }
  };

  const handleClearAttempts = async () => {
    if (!window.confirm('Are you sure you want to clear all attempts? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      
      // Clear attempts from backend
      await api.delete(`/sessions/${sessionId}/attempts/clear`);

      // Update local state - clear all attempts but keep athlete data
      const clearedAthletes = athletes.map(athlete => ({
        ...athlete,
        attempts: [],
        totals: { snatch: 0, clean_jerk: 0, total: 0 },
        bestSnatch: 0,
        bestCleanJerk: 0,
        total: 0,
        is_dq: false,
        rank: null
      }));

      setAthletes(clearedAthletes);
      setNextLifter(null);
      setPreviousLifter(null);
      setTimerRunning(false);
      setTimerKey(prev => prev + 1);
      
      toast.success('All attempts cleared successfully');
    } catch (error) {
      console.error('Clear attempts error:', error);
      toast.error('Failed to clear attempts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-900 p-4">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-zinc-700 hover:bg-slate-200 dark:hover:bg-zinc-600 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {session?.name || 'Loading...'}
              </h1>
              <div className="text-sm text-slate-600 dark:text-zinc-400">
                Technical Panel - Spreadsheet Sheet
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                 Saving...
              </span>
            )}
            {!saving && lastSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-semibold">
                <Check size={14} />
                Saved
              </span>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={handleClearAttempts}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Clear Attempts
            </button>
            <button
              onClick={() => {
                setForceEditMode(!forceEditMode);
                toast.success(forceEditMode ? 'Force Edit: OFF' : 'Force Edit: ON - All restrictions disabled');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                forceEditMode 
                  ? 'bg-red-700 hover:bg-red-800 text-white ring-2 ring-red-500' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Unlock size={16} />
              Force Edit {forceEditMode ? '(ON)' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Next Lifter Panel - Live Update with Timer */}
      {nextLifter && (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700 print:hidden mb-4">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-full text-sm font-medium">
               NEXT LIFTER
              </span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {nextLifter.displayName}
                </span>
                <span className="text-slate-400 dark:text-zinc-500">•</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                  {nextLifter.liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
                </span>
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-medium">
                  Attempt {nextLifter.attemptNumber}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-semibold">
                  {nextLifter.weight} kg
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              
             
              <div className="h-6 w-px bg-slate-300 dark:bg-zinc-600"></div>
              {/* IWF Timer Rule Indicator */}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                timerDuration === 120 
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                  : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              }`}>
               
              </span>
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-slate-600 dark:text-zinc-400" />
                <CompetitionTimer 
                  key={timerKey}
                  duration={timerDuration} 
                  isRunning={timerRunning}
                  onStart={() => setTimerRunning(true)}
                  onPause={() => setTimerRunning(false)}
                  onReset={() => {
                    setTimerRunning(false);
                    setTimerKey(prev => prev + 1);
                  }}
                  compact={true} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Sheet */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Competition Sheet
          </h2>
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-lg">Loading session data...</div>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600 dark:text-red-400">
            <div className="text-lg font-semibold">Error Loading Session</div>
            <div className="text-sm mt-2">{error}</div>
          </div>
        )}

        {/* Spreadsheet Table */}
        {!loading && !error && (
          <div className="overflow-x-auto rounded-lg border-2 border-slate-300 dark:border-zinc-700">
            <table className="w-full border-collapse bg-white dark:bg-zinc-900">
              <thead>
                <tr className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-zinc-800 dark:to-zinc-700">
                  <th rowSpan="2" className="p-4 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 w-16">
                    No
                  </th>
                  <th rowSpan="2" className="p-4 text-left text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 min-w-[180px]">
                    Name
                  </th>
                  <th rowSpan="2" className="p-4 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 min-w-[100px]">
                    Team
                  </th>
                  <th colSpan="4" className="p-3 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b border-slate-400 dark:border-zinc-600 bg-blue-50 dark:bg-blue-900/20">
                    SNATCH
                  </th>
                  <th colSpan="4" className="p-3 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b border-slate-400 dark:border-zinc-600 bg-purple-50 dark:bg-purple-900/20">
                    CLEAN & JERK
                  </th>
                  <th rowSpan="2" className="p-4 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 bg-amber-50 dark:bg-amber-900/20 min-w-[80px]">
                    TOTAL
                  </th>
                  <th rowSpan="2" className="p-4 text-center text-sm font-bold text-slate-800 dark:text-white border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 min-w-[70px]">
                    RANK
                  </th>
                  <th rowSpan="2" className="p-4 text-center text-sm font-bold text-slate-800 dark:text-white border-b-2 border-slate-400 dark:border-zinc-600 min-w-[60px]">
                    DQ
                  </th>
                </tr>
                <tr className="bg-gradient-to-r from-slate-50 to-white dark:from-zinc-700 dark:to-zinc-800">
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-blue-50 dark:bg-blue-900/10">1</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-blue-50 dark:bg-blue-900/10">2</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-blue-50 dark:bg-blue-900/10">3</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 bg-blue-100 dark:bg-blue-900/30">Best</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-purple-50 dark:bg-purple-900/10">1</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-purple-50 dark:bg-purple-900/10">2</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r border-b-2 border-slate-400 dark:border-zinc-600 bg-purple-50 dark:bg-purple-900/10">3</th>
                  <th className="p-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 border-r-2 border-b-2 border-slate-400 dark:border-zinc-600 bg-purple-100 dark:bg-purple-900/30">Best</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete, index) => {
                  // Check if this athlete is the next lifter
                  const isNextLifter = nextLifter && nextLifter.athlete.id === athlete.id;
                  
                  return (
                    <tr 
                      key={athlete.id} 
                      className={`transition-all duration-300 h-[52px] ${
                        isNextLifter 
                          ? 'bg-gradient-to-r from-yellow-200 via-amber-200 to-yellow-200 dark:from-yellow-700 dark:via-amber-700 dark:to-yellow-700 shadow-lg ring-4 ring-yellow-500 ring-opacity-50 scale-[1.02]' 
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                      }`}
                    >
                    <td className="p-3 text-base font-bold text-center text-slate-800 dark:text-white border-r-2 border-b border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/30">
                      {index + 1}
                    </td>
                    <td className="p-3 text-sm font-semibold text-slate-800 dark:text-white border-r-2 border-b border-slate-300 dark:border-zinc-700">
                      {athlete.name}
                    </td>
                    <td className="p-3 text-sm text-center text-slate-600 dark:text-zinc-400 border-r-2 border-b border-slate-300 dark:border-zinc-700">
                      {athlete.teams?.country || athlete.country || '-'}
                    </td>
                    
                    {/* Snatch Attempts */}
                    {[1, 2, 3].map(attemptNum => (
                      <td key={`snatch-${attemptNum}`} className="border-r border-b border-slate-300 dark:border-zinc-700 p-0 h-[52px]">
                        <AttemptCell
                          athlete={athlete}
                          attemptType="snatch"
                          attemptNumber={attemptNum}
                          onUpdate={handleAttemptUpdate}
                          previousAttempts={athlete.attempts || []}
                          forceEditMode={forceEditMode}
                        />
                      </td>
                    ))}

                    {/* Best Snatch */}
                    <td className="p-3 text-base font-bold text-center text-slate-900 dark:text-white border-r-2 border-b border-slate-300 dark:border-zinc-700 bg-green-100 dark:bg-green-900/30">
                      {athlete.bestSnatch > 0 ? athlete.bestSnatch : '-'}
                    </td>

                    {/* Clean & Jerk Attempts */}
                    {[1, 2, 3].map(attemptNum => (
                      <td key={`clean_and_jerk-${attemptNum}`} className="border-r border-b border-slate-300 dark:border-zinc-700 p-0 h-[52px]">
                        <AttemptCell
                          athlete={athlete}
                          attemptType="clean_and_jerk"
                          attemptNumber={attemptNum}
                          onUpdate={handleAttemptUpdate}
                          previousAttempts={athlete.attempts || []}
                          forceEditMode={forceEditMode}
                        />
                      </td>
                    ))}

                    {/* Best C&J */}
                    <td className="p-3 text-base font-bold text-center text-slate-900 dark:text-white border-r-2 border-b border-slate-300 dark:border-zinc-700 bg-green-100 dark:bg-green-900/30">
                      {athlete.bestCleanJerk > 0 ? athlete.bestCleanJerk : '-'}
                    </td>

                    {/* Total */}
                    <td className="p-3 text-lg font-extrabold text-center text-slate-900 dark:text-white border-r-2 border-b border-slate-300 dark:border-zinc-700 bg-amber-100 dark:bg-amber-900/30">
                      {athlete.total > 0 ? athlete.total : '-'}
                    </td>

                    {/* Rank */}
                    <td className="p-3 text-lg font-extrabold text-center border-r-2 border-b border-slate-300 dark:border-zinc-700">
                      {athlete.rank ? (
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${
                          athlete.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          athlete.rank === 2 ? 'bg-gray-300 text-gray-900' :
                          athlete.rank === 3 ? 'bg-orange-400 text-orange-900' :
                          'bg-slate-200 dark:bg-zinc-700 text-slate-800 dark:text-white'
                        }`}>
                          {athlete.rank}
                        </span>
                      ) : '-'}
                    </td>

                    {/* DQ */}
                    <td className="p-3 text-center border-b border-slate-300 dark:border-zinc-700">
                      <input
                        type="checkbox"
                        checked={athlete.is_dq || false}
                        onChange={(e) => handleDQToggle(athlete.id, e.target.checked)}
                        className="w-5 h-5 cursor-pointer accent-red-600"
                      />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
