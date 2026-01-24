import { useState, useEffect, useRef } from 'react';
import { Check, X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AttemptCell({ athlete, attemptType, attemptNumber, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  // Find the attempt data
  const attempt = athlete?.attempts?.find(
    a => a.lift_type === attemptType && a.attempt_number === attemptNumber
  ) || null;

  const weight = attempt?.requested_weight || '';
  const result = attempt?.result;

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
    if (result !== null) return; // Can't edit completed attempts
    
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

    try {
      if (attempt) {
        // Update existing attempt
        const updatedAttempt = {
          ...attempt,
          requested_weight: weightValue
        };
        await onUpdate(updatedAttempt);
      } else {
        // Create new attempt
        const newAttempt = {
          athlete_id: athlete.id,
          lift_type: attemptType,
          attempt_number: attemptNumber,
          requested_weight: weightValue,
          result: null
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

  const toggleResult = () => {
    if (!weight || !attempt) return;
    
    let newResult;
    if (result === 'good') {
      newResult = 'no_lift';
    } else if (result === 'no_lift') {
      newResult = null;
    } else {
      newResult = 'good';
    }
    
    const updatedAttempt = {
      ...attempt,
      result: newResult
    };
    onUpdate(updatedAttempt);
  };

  const getCellStyle = () => {
    if (!weight) {
      return 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-700';
    }
    if (result === 'good') {
      return 'bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 border-green-400';
    }
    if (result === 'no_lift') {
      return 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 border-red-400';
    }
    // Pending attempt (weight entered but no result)
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 border-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/50';
  };

  return (
    <div 
      className={`min-h-[40px] p-2 cursor-pointer transition-colors border-2 border-transparent ${getCellStyle()}`}
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
          className="w-full bg-transparent text-center font-medium outline-none text-slate-900 dark:text-white"
          placeholder="0"
        />
      ) : (
        <div className="flex items-center justify-center gap-1 h-full">
          {weight ? (
            <>
              <span className="font-medium text-center">
                {weight}kg
              </span>
              {result === 'good' && <Check size={16} className="text-green-600" />}
              {result === 'no_lift' && <X size={16} className="text-red-600" />}
              {result === null && weight && (
                <div 
                  className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleResult();
                  }}
                >
                  <Edit size={12} className="text-slate-600 dark:text-zinc-400" />
                </div>
              )}
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              {result === null ? 'Click to enter' : '-'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}