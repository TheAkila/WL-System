import { useState, useEffect, useRef } from 'react';
import { Check, X, SkipForward } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttemptCell({ athlete, attemptType, attemptNumber, onUpdate, previousAttempts = [], forceEditMode = false, isDQ = false, nextLifter = null }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  // Find the attempt data
  const attempt = athlete?.attempts?.find(
    a => a.lift_type === attemptType && a.attempt_number === attemptNumber
  ) || null;

  const weight = attempt?.weight || attempt?.requested_weight || '';
  const result = attempt?.result;
  const editCount = attempt?.edit_count || 0;
  const maxEdits = 3;
  const editsRemaining = maxEdits - editCount;

  // Get previous successful weight for validation (ascending order rule)
  const previousGoodWeights = previousAttempts
    .filter(a => a.lift_type === attemptType && a.result === 'good')
    .map(a => a.weight || a.requested_weight || 0);
  
  const minWeight = previousGoodWeights.length > 0 
    ? Math.max(...previousGoodWeights) 
    : 0;

  useEffect(() => {
    setInputValue(weight || '');
  }, [weight]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleCellClick = () => {
    // In force edit mode, allow editing anything
    if (forceEditMode) {
      if (!isEditing) {
        setIsEditing(true);
      }
      return;
    }
    
    // Check if edits are exhausted
    if (attempt && editCount >= maxEdits) {
      toast.error(`Cannot edit: Maximum ${maxEdits} changes allowed per attempt`);
      return;
    }
    
    // Allow editing weight only if no result set yet (except not_attempted)
    if (result !== null && result !== undefined && result !== 'not_attempted') {
      return;
    }
    
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+(\.\d{0,2})?$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 999)) {
      setInputValue(value);
    }
  };

  const handleSave = async () => {
    const weightValue = inputValue ? parseFloat(inputValue) : null;
    
    if (weightValue === null || weightValue === 0) {
      setInputValue('');
      setIsEditing(false);
      return;
    }

    // Weight validation - must be equal or higher than previous good lift (IWF rule)
    if (weightValue <= minWeight) {
      toast.error(`Weight must be higher than previous good lift (${minWeight}kg)`);
      return;
    }

    // Check attempt limit (max 3 attempts per lift)
    const completedAttempts = previousAttempts.filter(
      a => a.lift_type === attemptType && a.result !== null && a.result !== 'not_attempted'
    ).length;

    if (completedAttempts >= 3 && !attempt) {
      toast.error('❌ Maximum 3 attempts per lift type already reached');
      return;
    }

    try {
      if (attempt) {
        // Check if weight is actually changing
        const isWeightChanging = weightValue !== (attempt.weight || attempt.requested_weight);
        const newEditCount = isWeightChanging ? editCount + 1 : editCount;
        
        // Verify edit limit (unless in force edit mode)
        if (!forceEditMode && isWeightChanging && newEditCount > maxEdits) {
          toast.error(`Cannot edit: Maximum ${maxEdits} changes allowed per attempt`);
          setInputValue(weight || '');
          setIsEditing(false);
          return;
        }
        
        // Update existing attempt
        const updatedAttempt = {
          ...attempt,
          weight: weightValue,
          requested_weight: weightValue,
          edit_count: forceEditMode ? editCount : newEditCount // Don't increment in force edit mode
        };
        await onUpdate(updatedAttempt);
        
        if (isWeightChanging && !forceEditMode) {
          const remaining = maxEdits - newEditCount;
          toast.success(`Weight updated (${remaining} ${remaining === 1 ? 'change' : 'changes'} remaining)`);
        } else if (forceEditMode) {
          toast.success('Weight updated (Force Edit mode)');
        }
      } else {
        // Create new attempt (first edit = 0)
        const newAttempt = {
          athlete_id: athlete.id,
          lift_type: attemptType,
          attempt_number: attemptNumber,
          weight: weightValue,
          requested_weight: weightValue,
          result: 'pending',
          edit_count: 0
        };
        await onUpdate(newAttempt);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving attempt:', error);
      toast.error('Failed to save weight');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(weight || '');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const toggleResult = async () => {
    if (!weight || !attempt) return;
    
    let newResult;
    if (result === 'good') {
      newResult = 'no_lift';
    } else if (result === 'no_lift') {
      newResult = 'good';
    } else {
      newResult = 'good';
    }
    
    const updatedAttempt = {
      ...attempt,
      result: newResult
    };
    
    try {
      await onUpdate(updatedAttempt);
      toast.success(`Result: ${newResult === 'good' ? 'Good Lift ✓' : 'No Lift ✗'}`);
    } catch (error) {
      console.error('Error updating result:', error);
      toast.error('Failed to update result');
    }
  };

  // Admin marks result as Good Lift
  const markGoodLift = async () => {
    if (!weight || !attempt) return;
    
    const updatedAttempt = {
      ...attempt,
      result: 'good'
    };
    
    try {
      await onUpdate(updatedAttempt);
      toast.success('✓ Good Lift');
    } catch (error) {
      console.error('Error marking good lift:', error);
      toast.error('Failed to update result');
    }
  };

  // Admin marks result as No Lift
  const markNoLift = async () => {
    if (!weight || !attempt) return;
    
    const updatedAttempt = {
      ...attempt,
      result: 'no_lift'
    };
    
    try {
      await onUpdate(updatedAttempt);
      toast.success('✗ No Lift');
    } catch (error) {
      console.error('Error marking no lift:', error);
      toast.error('Failed to update result');
    }
  };

  const markNotAttempted = async () => {
    const updatedAttempt = attempt 
      ? { ...attempt, result: 'not_attempted', weight: null, requested_weight: null }
      : {
          athlete_id: athlete.id,
          lift_type: attemptType,
          attempt_number: attemptNumber,
          weight: null,
          requested_weight: null,
          result: 'not_attempted'
        };
    
    try {
      await onUpdate(updatedAttempt);
      setInputValue('');
      toast.success('Marked as Not Attempted');
    } catch (error) {
      console.error('Error marking not attempted:', error);
      toast.error('Failed to update');
    }
  };

  const getCellStyle = () => {
    // Check if this is the next lifter's attempt
    const isNextLifter = nextLifter && 
      nextLifter.athlete.id === athlete.id && 
      nextLifter.liftType === attemptType && 
      nextLifter.attemptNumber === attemptNumber;

    // If this is the next lifter, highlight in blue with blink animation
    if (isNextLifter) {
      return 'animate-pulse bg-blue-500 dark:bg-blue-700 text-blue-900 dark:text-blue-50 border-blue-700 font-bold ring-2 ring-blue-500';
    }

    // If athlete is DQ'd, all attempts are red
    if (athlete?.is_dq) {
      return 'bg-red-400 dark:bg-red-900/75 text-red-900 dark:text-red-50 border-red-600 font-semibold';
    }
    
    if (result === 'not_attempted') {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-semibold';
    }
    if (!weight) {
      return 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700';
    }
    if (result === 'good') {
      return 'bg-green-300 dark:bg-green-800/75 text-green-900 dark:text-green-50 border-green-600';
    }
    if (result === 'no_lift') {
      return 'bg-red-300 dark:bg-red-900/75 text-red-900 dark:text-red-50 border-red-600';
    }
    // Pending state - yellow
    return 'bg-yellow-300 dark:bg-yellow-900/75 text-yellow-900 dark:text-yellow-50 border-yellow-600 hover:bg-yellow-400 dark:hover:bg-yellow-900/85';
  };

  return (
    <div 
      className={`w-full h-full cursor-pointer transition-colors flex items-center justify-center overflow-hidden ${getCellStyle()}`}
      onClick={handleCellClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full h-full bg-transparent text-center font-bold text-lg outline-none text-slate-900 dark:text-white"
          placeholder="0"
        />
      ) : result === 'not_attempted' ? (
        <span className="text-sm font-bold">N/A</span>
      ) : weight ? (
        <div className="w-full h-full flex items-center justify-center group relative">
          {/* Weight display - always visible and centered */}
          <span className="font-bold text-base">
            {weight}kg
          </span>
          
          {/* Edit count indicator - always visible in top right */}
          {editCount > 0 && (
            <span className="absolute top-1 right-1 text-[8px] font-bold opacity-70 bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white px-1 rounded-full">
              {editCount}
            </span>
          )}
          
          {/* Admin decision buttons - only show on hover during pending state */}
          {result === 'pending' ? (
            <div className="absolute flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markGoodLift();
                }}
                className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-bold text-xs"
                title="Mark as Good Lift"
              >
                ✓
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markNoLift();
                }}
                className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-bold text-xs"
                title="Mark as No Lift"
              >
                ✗
              </button>
              {weight && (
                <button
                  className="p-0.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotAttempted();
                  }}
                  title="Mark Not Attempted (N/A)"
                >
                  <SkipForward size={12} className="text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          ) : (
            <>
              {result === 'good' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleResult();
                  }}
                  className="text-lg hover:opacity-70 transition-opacity cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Click to change to No Lift"
                >
                  ✓
                </button>
              )}
              {result === 'no_lift' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleResult();
                  }}
                  className="text-lg hover:opacity-70 transition-opacity cursor-pointer opacity-0 group-hover:opacity-100"
                  title="Click to change to Good Lift"
                >
                  ✗
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-full" />
      )}
    </div>
  );
}
