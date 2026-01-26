import { useState, useEffect, useCallback } from 'react';
import { Printer, Download, RefreshCw, ArrowLeft, Timer, Check, Trash2, Unlock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AttemptCell from './AttemptCell';
import socketService from '../../services/socket';
import CompetitionTimer from './CompetitionTimer';
import WeighInModal from './WeighInModal';
import PhaseControlButtons from './PhaseControlButtons';

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
  const [showWeighInModal, setShowWeighInModal] = useState(false); // Phase 2: Weigh-in modal state
  const [selectedWeightClass, setSelectedWeightClass] = useState(null); // Multi-class: selected weight class
  const [availableWeightClasses, setAvailableWeightClasses] = useState([]); // Multi-class: all weight classes in session

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

  // Calculate rankings (without reordering rows, DQ athletes at bottom)
  const calculateRankings = (athletesData) => {
    const withResults = calculateResults(athletesData);
    
    // Separate DQ and active athletes
    const activeAthletes = withResults.filter(a => !a.is_dq);
    const dqAthletes = withResults.filter(a => a.is_dq);
    
    // Group active athletes by weight class for separate ranking
    const athletesByClass = {};
    activeAthletes.forEach(athlete => {
      const wc = athlete.weight_category;
      if (!athletesByClass[wc]) {
        athletesByClass[wc] = [];
      }
      athletesByClass[wc].push(athlete);
    });

    // Create rank map with per-class rankings
    const rankMap = {};
    Object.keys(athletesByClass).forEach(weightClass => {
      // Sort athletes within this weight class
      const classAthletes = athletesByClass[weightClass].slice().sort((a, b) => {
        if (a.total !== b.total) return b.total - a.total;
        if (a.bodyweight !== b.bodyweight) return a.bodyweight - b.bodyweight;
        return (a.start_number || 0) - (b.start_number || 0);
      });
      
      // Assign ranks within this class
      classAthletes.forEach((athlete, index) => {
        rankMap[athlete.id] = athlete.total > 0 ? index + 1 : null;
      });
    });

    // Return active athletes in original order with calculated ranks, then DQ athletes at bottom
    const activeWithRanks = activeAthletes.map(athlete => ({
      ...athlete,
      rank: rankMap[athlete.id] || null
    }));

    // DQ athletes with no rank
    const dqWithRanks = dqAthletes.map(athlete => ({
      ...athlete,
      rank: null
    }));

    return [...activeWithRanks, ...dqWithRanks];
  };

  // Calculate next lifter based on IWF rules
  const calculateNextLifter = useCallback((athletesData, currentPhase = null) => {
    if (!athletesData || athletesData.length === 0) return null;

    const activeAthletes = athletesData.filter(a => !a.is_dq);
    if (activeAthletes.length === 0) return null;

    // Collect all pending attempts with their details
    const pendingAttempts = [];

    activeAthletes.forEach(athlete => {
      // Determine which lift type to check based on current phase
      let skipSnatch = false;
      let skipCJ = false;

      // If in clean_jerk_active phase, prioritize C&J and ignore snatch
      if (currentPhase === 'clean_jerk_active') {
        skipSnatch = true;
      }
      // If in snatch_active phase, prioritize snatch and ignore C&J
      else if (currentPhase === 'snatch_active') {
        skipCJ = true;
      }

      // Check snatch attempts (1, 2, 3)
      let hasSnatchPending = false;
      if (!skipSnatch) {
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
      }

      // Check clean & jerk attempts (1, 2, 3) - only if no pending snatch attempts (or in C&J phase)
      if (!skipCJ && (!hasSnatchPending || currentPhase === 'clean_jerk_active')) {
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
    // 1. For current phase: same lift type comes first
    // 2. Lower weight first (ascending)
    // 3. Lower attempt number first
    // 4. Lower start number first (tie-breaker)
    pendingAttempts.sort((a, b) => {
      // If in specific phase, prioritize that lift type
      if (currentPhase === 'clean_jerk_active' || currentPhase === 'snatch_active') {
        // Same lift type, sort by weight
        if (a.liftType === b.liftType) {
          if (a.weight !== b.weight) return a.weight - b.weight;
          if (a.attemptNumber !== b.attemptNumber) return a.attemptNumber - b.attemptNumber;
          return (a.athlete.start_number || 0) - (b.athlete.start_number || 0);
        }
        // Different lift types
        return 0; // Only one type should be in pendingAttempts in active phase
      }

      // Normal flow (multiple phases): Snatch before C&J
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
      
      // Extract available weight classes from athletes (for reference only, not for filtering)
      const uniqueWeightClasses = [...new Set(transformedAthletes.map(a => a.weight_category))].sort();
      setAvailableWeightClasses(uniqueWeightClasses);
      
      // Don't filter by weight class - show all classes in one sheet
      
      const withCalculations = calculateRankings(transformedAthletes);
      setAthletes(withCalculations);
      
      // Calculate initial next lifter with current session state
      const next = calculateNextLifter(withCalculations, session?.state);
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
      
      // Update next lifter after data entry with current session state
      const next = calculateNextLifter(rankedAthletes, session?.state);
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

  // Phase 2: Handle state changes from SessionCard and PhaseControlButtons
  const handleSessionStateChange = async (response) => {
    // Refresh session data after state change
    await fetchSessionData();
    toast.success('Session state updated');
  };

  // Phase 2: Handle weigh-in modal close and refresh
  const handleWeighInComplete = async () => {
    setShowWeighInModal(false);
    await fetchSessionData();
    toast.success('Weigh-in completed');
  };

  // Group athletes by weight class in ascending order
  const getAthletesGroupedByClass = () => {
    const grouped = {};
    athletes.forEach(athlete => {
      const wc = athlete.weight_category;
      if (!grouped[wc]) {
        grouped[wc] = [];
      }
      grouped[wc].push(athlete);
    });
    
    // Sort weight classes numerically (ascending)
    const sortedClasses = Object.keys(grouped)
      .map(wc => ({ wc, num: parseInt(wc) }))
      .sort((a, b) => a.num - b.num)
      .map(item => item.wc);
    
    return { grouped, sortedClasses };
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-900 p-2">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 mb-3">
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
            {/* Phase 2: PhaseControlButtons Component */}
            <PhaseControlButtons
              session={session}
              onStateChange={handleSessionStateChange}
              onRefresh={fetchSessionData}
              compact={true}
              className="flex gap-2"
            />
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
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Competition Sheet
            </h2>
            {availableWeightClasses.length > 1 && (
              <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">
                Weight Classes: {availableWeightClasses.map(wc => `${wc}kg`).join(' / ')}
              </p>
            )}
          </div>
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
          <div className="overflow-hidden">
            <table className="w-full border-collapse bg-white dark:bg-zinc-900 table-fixed border-2 border-gray-400 dark:border-gray-600\">
              <colgroup>
                <col style={{ width: '50px' }} />
                <col style={{ width: '150px' }} />
                <col style={{ width: '100px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '70px' }} />
                <col style={{ width: '60px' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-800 h-[52px]">
                  <th rowSpan="2" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    No
                  </th>
                  <th rowSpan="2" className="p-3 text-left text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    Name
                  </th>
                  <th rowSpan="2" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    Team
                  </th>
                  <th colSpan="4" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    SNATCH
                  </th>
                  <th colSpan="4" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    CLEAN & JERK
                  </th>
                  <th rowSpan="2" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    TOTAL
                  </th>
                  <th rowSpan="2" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    RANK
                  </th>
                  <th rowSpan="2" className="p-3 text-center text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                    DQ
                  </th>
                </tr>
                <tr className="bg-gray-200 dark:bg-gray-800 h-[40px]">
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">1</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">2</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">3</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">Best</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">1</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">2</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">3</th>
                  <th className="p-2 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">Best</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const { grouped, sortedClasses } = getAthletesGroupedByClass();
                  let globalIndex = 0;
                  
                  return sortedClasses.map(weightClass => (
                    <div key={weightClass} className="contents">
                      {/* Weight Class Section Header - Clean Design */}
                      <tr className="h-11 bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600">
                        <td colSpan="14" className="p-3 text-sm font-bold text-black dark:text-white border-2 border-gray-400 dark:border-gray-600">
                          {weightClass}kg Weight Class 
                        </td>
                      </tr>
                      
                      {/* Athletes in this weight class */}
                      {grouped[weightClass].map((athlete, classIndex) => {
                        globalIndex++;
                        const isEvenRow = classIndex % 2 === 0;
                        return (
                          <tr 
                            key={athlete.id} 
                            className="h-[52px] bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border-b border-gray-300 dark:border-gray-700 overflow-hidden"
                          >
                            <td className="p-2 text-sm font-bold text-center text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600">
                              {globalIndex}
                            </td>
                            <td className="p-2 text-sm font-semibold text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600">
                              <span className="truncate block">{athlete.name}</span>
                            
                            </td>
                            <td className="p-2 text-sm text-center text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600">
                              {athlete.teams?.country || athlete.country || '-'}
                            </td>
                            
                            {/* Snatch Attempts */}
                            {[1, 2, 3].map(attemptNum => (
                              <td key={`snatch-${attemptNum}`} className="border-2 border-r border-gray-400 dark:border-gray-600 p-0 relative" style={{ height: '52px', maxHeight: '52px' }}>
                                <div className="absolute inset-0 overflow-hidden">
                                  <AttemptCell
                                    athlete={athlete}
                                    attemptType="snatch"
                                    attemptNumber={attemptNum}
                                    onUpdate={handleAttemptUpdate}
                                    previousAttempts={athlete.attempts || []}
                                    forceEditMode={forceEditMode}
                                    isDQ={athlete.is_dq}
                                    nextLifter={nextLifter}
                                  />
                                </div>
                              </td>
                            ))}

                            {/* Best Snatch */}
                            <td className="p-2 text-base font-bold text-center text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                              {athlete.bestSnatch > 0 ? athlete.bestSnatch : '-'}
                            </td>

                            {/* Clean & Jerk Attempts */}
                            {[1, 2, 3].map(attemptNum => (
                              <td key={`clean_and_jerk-${attemptNum}`} className="border-2 border-r border-gray-400 dark:border-gray-600 p-0 relative" style={{ height: '52px', maxHeight: '52px' }}>
                                <div className="absolute inset-0 overflow-hidden">
                                  <AttemptCell
                                    athlete={athlete}
                                    attemptType="clean_and_jerk"
                                    attemptNumber={attemptNum}
                                    onUpdate={handleAttemptUpdate}
                                    previousAttempts={athlete.attempts || []}
                                    forceEditMode={forceEditMode}
                                    isDQ={athlete.is_dq}
                                    nextLifter={nextLifter}
                                  />
                                </div>
                              </td>
                            ))}

                            {/* Best C&J */}
                            <td className="border-2 border-r border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 p-0 relative" style={{ height: '52px', maxHeight: '52px' }}>
                              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                <span className="text-base font-bold text-black dark:text-white">
                                  {athlete.bestCleanJerk > 0 ? athlete.bestCleanJerk : '-'}
                                </span>
                              </div>
                            </td>

                            {/* Total */}
                            <td className="p-2 text-base font-bold text-center text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                              {athlete.total > 0 ? athlete.total : '-'}
                            </td>

                            {/* Rank */}
                            <td className="p-2 text-base font-bold text-center text-black dark:text-white border-2 border-r border-gray-400 dark:border-gray-600">
                              {athlete.rank ? (
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold">
                                  {athlete.rank}
                                </span>
                              ) : '-'}
                            </td>

                            {/* DQ */}
                            <td className="border-2 border-gray-400 dark:border-gray-600 p-0 relative" style={{ height: '52px', maxHeight: '52px' }}>
                              <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={athlete.is_dq || false}
                                  onChange={(e) => {
                                    const newAthletes = athletes.map(a =>
                                      a.id === athlete.id ? { ...a, is_dq: e.target.checked } : a
                                    );
                                    setAthletes(newAthletes);
                                    fetch(`/api/athletes/${athlete.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ is_dq: e.target.checked })
                                    });
                                  }}
                                  className="w-5 h-5 cursor-pointer accent-gray-400"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </div>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
