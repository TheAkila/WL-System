import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, X, ChevronDown } from 'lucide-react';
import api from '../../services/api';

export default function AttemptForm({ 
  session, 
  selectedAthlete, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState({
    snatch: [
      { attempt_number: 1, weight: '', result: '' },
      { attempt_number: 2, weight: '', result: '' },
      { attempt_number: 3, weight: '', result: '' }
    ],
    clean_and_jerk: [
      { attempt_number: 1, weight: '', result: '' },
      { attempt_number: 2, weight: '', result: '' },
      { attempt_number: 3, weight: '', result: '' }
    ]
  });

  // Load existing attempts for this athlete
  useEffect(() => {
    if (selectedAthlete && session) {
      loadAttempts();
    }
  }, [selectedAthlete, session]);

  const loadAttempts = async () => {
    try {
      // Fetch athlete data if missing
      if (!selectedAthlete.body_weight) {
        const athleteResponse = await api.get(`/athletes/${selectedAthlete.id}`);
        if (athleteResponse.data?.data) {
          // Data is already in selectedAthlete, but we can enhance it
        }
      }

      const response = await api.get(
        `/attempts/athlete/${selectedAthlete.id}?session_id=${session.id}`
      );
      if (response.data && response.data.length > 0) {
        const snatchAttempts = response.data.filter(a => a.lift_type === 'snatch');
        const cleanJerkAttempts = response.data.filter(a => a.lift_type === 'clean_and_jerk');
        
        setAttempts({
          snatch: [1, 2, 3].map(num => {
            const existing = snatchAttempts.find(a => a.attempt_number === num);
            return {
              attempt_number: num,
              weight: existing?.weight || '',
              result: existing?.result || '',
              id: existing?.id
            };
          }),
          clean_and_jerk: [1, 2, 3].map(num => {
            const existing = cleanJerkAttempts.find(a => a.attempt_number === num);
            return {
              attempt_number: num,
              weight: existing?.weight || '',
              result: existing?.result || '',
              id: existing?.id
            };
          })
        });
      }
    } catch (error) {
      console.error('Error loading attempts:', error);
      toast.error('Failed to load attempts');
    }
  };

  const handleAttemptChange = (liftType, index, field, value) => {
    setAttempts(prev => {
      const updated = { ...prev };
      updated[liftType][index] = {
        ...updated[liftType][index],
        [field]: value
      };
      return updated;
    });
  };

  const getBestAttempt = (liftAttempts) => {
    const validAttempts = liftAttempts
      .filter(a => a.weight && a.result === 'good')
      .map(a => parseFloat(a.weight) || 0);
    return validAttempts.length > 0 ? Math.max(...validAttempts) : 0;
  };

  const handleSave = async () => {
    if (!selectedAthlete) {
      toast.error('Please select an athlete');
      return;
    }

    // Validate that weights are entered
    const hasWeights = [
      ...attempts.snatch,
      ...attempts.clean_and_jerk
    ].some(a => a.weight);

    if (!hasWeights) {
      toast.error('Please enter at least one weight');
      return;
    }

    setLoading(true);
    try {
      // Save snatch attempts
      for (const attempt of attempts.snatch) {
        if (attempt.weight) {
          if (attempt.id) {
            // Update existing
            await api.put(`/attempts/${attempt.id}`, {
              weight: parseFloat(attempt.weight),
              result: attempt.result
            });
          } else {
            // Create new
            await api.post('/attempts', {
              athlete_id: selectedAthlete.id,
              session_id: session.id,
              lift_type: 'snatch',
              attempt_number: attempt.attempt_number,
              weight: parseFloat(attempt.weight),
              result: attempt.result
            });
          }
        }
      }

      // Save clean & jerk attempts
      for (const attempt of attempts.clean_and_jerk) {
        if (attempt.weight) {
          if (attempt.id) {
            // Update existing
            await api.put(`/attempts/${attempt.id}`, {
              weight: parseFloat(attempt.weight),
              result: attempt.result
            });
          } else {
            // Create new
            await api.post('/attempts', {
              athlete_id: selectedAthlete.id,
              session_id: session.id,
              lift_type: 'clean_and_jerk',
              attempt_number: attempt.attempt_number,
              weight: parseFloat(attempt.weight),
              result: attempt.result
            });
          }
        }
      }

      toast.success(`✓ Attempts saved for ${selectedAthlete.name}`);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving attempts:', error);
      toast.error('Failed to save attempts');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedAthlete) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-center">Select an athlete to enter attempts</p>
      </div>
    );
  }

  const snatchBest = getBestAttempt(attempts.snatch);
  const cleanJerkBest = getBestAttempt(attempts.clean_and_jerk);
  const total = snatchBest + cleanJerkBest;

  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">{selectedAthlete.name}</h3>
            <p className="text-purple-100 text-sm">
              {selectedAthlete.body_weight}kg · {selectedAthlete.faculty}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-500 rounded transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Snatch Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-blue-400 pb-2">
              SNATCH
            </h4>
            <div className="space-y-4">
              {attempts.snatch.map((attempt, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attempt {attempt.attempt_number}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Weight (kg)"
                        value={attempt.weight}
                        onChange={(e) =>
                          handleAttemptChange('snatch', idx, 'weight', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={attempt.result}
                      onChange={(e) =>
                        handleAttemptChange('snatch', idx, 'result', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">No Result</option>
                      <option value="good">✓ Good</option>
                      <option value="no_lift">✗ No Lift</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Best Snatch:</p>
              <p className="text-2xl font-bold text-blue-600">{snatchBest}kg</p>
            </div>
          </div>

          {/* Clean & Jerk Section */}
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 border-b-2 border-red-400 pb-2">
              CLEAN & JERK
            </h4>
            <div className="space-y-4">
              {attempts.clean_and_jerk.map((attempt, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attempt {attempt.attempt_number}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="Weight (kg)"
                        value={attempt.weight}
                        onChange={(e) =>
                          handleAttemptChange('clean_and_jerk', idx, 'weight', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <select
                      value={attempt.result}
                      onChange={(e) =>
                        handleAttemptChange('clean_and_jerk', idx, 'result', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">No Result</option>
                      <option value="good">✓ Good</option>
                      <option value="no_lift">✗ No Lift</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Best C&J:</p>
              <p className="text-2xl font-bold text-red-600">{cleanJerkBest}kg</p>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300">
          <div className="flex justify-between items-center">
            <p className="text-lg font-bold text-gray-800">Total:</p>
            <p className="text-3xl font-bold text-purple-600">{total}kg</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Attempts'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
