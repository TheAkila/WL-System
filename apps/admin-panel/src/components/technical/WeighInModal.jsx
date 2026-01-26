import React, { useState, useEffect } from 'react';
import api from '../../services/api';

/**
 * WeighInModal Component - Phase 2 New Component
 * Handles athlete weigh-in with weight recording and progress tracking
 */

export default function WeighInModal({ session, onClose, onComplete }) {
  const [athletes, setAthletes] = useState([]);
  const [summary, setSummary] = useState(null);
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load athletes and weigh-in summary
  useEffect(() => {
    const fetchWeighInData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get weigh-in summary
        const summaryResponse = await api.get(`/sessions/${session.id}/weigh-in-summary`);
        if (summaryResponse.data.success) {
          setSummary(summaryResponse.data);
        }

        // Get athletes for this session
        const athletesResponse = await api.get(`/sessions/${session.id}/athletes`);
        console.log('📋 WeighIn Athletes Response:', {
          endpoint: `/sessions/${session.id}/athletes`,
          success: athletesResponse.data.success,
          athleteCount: athletesResponse.data.athletes?.length || 0,
          athletes: athletesResponse.data.athletes?.map(a => ({ 
            id: a.id, 
            name: a.name, 
            weight_category: a.weight_category,
            session_id: a.session_id 
          }))
        });

        if (athletesResponse.data.success) {
          setAthletes(athletesResponse.data.athletes);
          
          // Pre-populate weights for already weighed-in athletes
          const initialWeights = {};
          athletesResponse.data.athletes.forEach(athlete => {
            if (athlete.weighed_in) {
              initialWeights[athlete.id] = athlete.body_weight_kg;
            }
          });
          setWeights(initialWeights);
        }
      } catch (err) {
        console.error('❌ Error fetching weigh-in data:', err);
        setError('Failed to load athletes');
      } finally {
        setLoading(false);
      }
    };

    if (session?.id) {
      fetchWeighInData();
    }
  }, [session?.id]);

  const handleWeightChange = (athleteId, value) => {
    setWeights(prev => ({
      ...prev,
      [athleteId]: value === '' ? '' : parseFloat(value)
    }));
  };

  const handleMarkWeighedIn = async (athleteId) => {
    const weight = weights[athleteId];

    if (!weight || weight <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await api.post(`/sessions/${session.id}/weigh-in-athlete`, {
        athleteId: athleteId,
        bodyWeightKg: weight,
        startWeightKg: weight + 5, // Default: start 5kg above body weight
      });

      if (response.data.success) {
        // Update athlete in local state
        setAthletes(prev =>
          prev.map(athlete =>
            athlete.id === athleteId
              ? {
                  ...athlete,
                  weighed_in: true,
                  body_weight_kg: weight,
                  weigh_in_date: new Date().toISOString(),
                }
              : athlete
          )
        );

        setSuccessMessage(`✅ ${athletes.find(a => a.id === athleteId)?.name} weighed in`);

        // Refresh summary
        const summaryResponse = await api.get(`/sessions/${session.id}/weigh-in-summary`);
        if (summaryResponse.data.success) {
          setSummary(summaryResponse.data);
        }

        // Clear message after 2 seconds
        setTimeout(() => setSuccessMessage(null), 2000);
      } else {
        setError(response.data.message || 'Failed to record weight');
      }
    } catch (err) {
      console.error('Error recording weight:', err);
      setError(err.response?.data?.message || 'Failed to record weight');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteWeighIn = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await api.post(`/sessions/${session.id}/transitions/complete-weigh-in`, {
        userId: localStorage.getItem('userId'),
      });

      if (response.data.success) {
        onComplete && onComplete();
        onClose && onClose();
      } else {
        setError(response.data.message || 'Failed to complete weigh-in');
      }
    } catch (err) {
      console.error('Error completing weigh-in:', err);
      setError(err.response?.data?.message || 'Failed to complete weigh-in');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-slate-600">Loading athletes...</p>
          </div>
        </div>
      </div>
    );
  }

  const allWeighedIn = athletes.every(a => a.weighed_in);
  const completionPercentage = summary
    ? Math.round(summary.completion_percentage)
    : 0;
  
  // Group athletes by weight class (for display organization, not filtering)
  const athletesByClass = {};
  athletes.forEach(athlete => {
    if (!athletesByClass[athlete.weight_category]) {
      athletesByClass[athlete.weight_category] = [];
    }
    athletesByClass[athlete.weight_category].push(athlete);
  });
  
  const sortedClasses = Object.keys(athletesByClass).sort();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">🏋️ Weigh-In</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 text-2xl font-light leading-none"
            disabled={saving}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Progress Summary */}
          {summary && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-blue-900">
                  {summary.weighed_in} / {summary.total_athletes} Athletes
                </p>
                <span className="text-sm font-bold text-blue-700">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Multi-class display with weight class headers */}
          {sortedClasses.length > 1 ? (
            <div className="space-y-6">
              {sortedClasses.map(wc => (
                <div key={wc}>
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b-2 border-blue-300">
                    <h3 className="text-lg font-bold text-blue-600">{wc}kg</h3>
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {athletesByClass[wc]?.length || 0} athletes
                    </span>
                  </div>
                  <div className="space-y-2 mb-6">
                    {athletesByClass[wc]?.map(athlete => (
                      <div
                        key={athlete.id}
                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {/* Athlete Info */}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{athlete.name}</p>
                          <p className="text-xs text-slate-600">
                            {athlete.team_name}
                          </p>
                        </div>

                        {/* Weight Input or Display */}
                        {athlete.weighed_in ? (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold text-slate-900">{athlete.body_weight_kg}kg</p>
                              <p className="text-xs text-slate-600">Weighed in</p>
                            </div>
                            <span className="text-2xl">✅</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="Weight"
                              value={weights[athlete.id] || ''}
                              onChange={e => handleWeightChange(athlete.id, e.target.value)}
                              className="w-24 px-3 py-2 border border-slate-300 rounded text-right font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                              disabled={saving}
                            />
                            <span className="text-sm text-slate-600 w-6">kg</span>
                            <button
                              onClick={() => handleMarkWeighedIn(athlete.id)}
                              disabled={!weights[athlete.id] || saving}
                              className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:bg-slate-300"
                            >
                              ✓
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : athletes.length > 0 ? (
            // Single-class display (no headers needed)
            <div className="space-y-2">
              {athletes.map(athlete => (
                <div
                  key={athlete.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {/* Athlete Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{athlete.name}</p>
                    <p className="text-xs text-slate-600">
                      {athlete.team_name}
                    </p>
                  </div>

                  {/* Weight Input or Display */}
                  {athlete.weighed_in ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{athlete.body_weight_kg}kg</p>
                        <p className="text-xs text-slate-600">Weighed in</p>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Weight"
                        value={weights[athlete.id] || ''}
                        onChange={e => handleWeightChange(athlete.id, e.target.value)}
                        className="w-24 px-3 py-2 border border-slate-300 rounded text-right font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                        disabled={saving}
                      />
                      <span className="text-sm text-slate-600 w-6">kg</span>
                      <button
                        onClick={() => handleMarkWeighedIn(athlete.id)}
                        disabled={!weights[athlete.id] || saving}
                        className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:bg-slate-300"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : athletes.length > 0 ? (
            // Single-class display (no headers needed)
            <div className="space-y-2">
              {athletes.map(athlete => (
                <div
                  key={athlete.id}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {/* Athlete Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{athlete.name}</p>
                    <p className="text-xs text-slate-600">
                      {athlete.team_name}
                    </p>
                  </div>

                  {/* Weight Input or Display */}
                  {athlete.weighed_in ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{athlete.body_weight_kg}kg</p>
                        <p className="text-xs text-slate-600">Weighed in</p>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="Weight"
                        value={weights[athlete.id] || ''}
                        onChange={e => handleWeightChange(athlete.id, e.target.value)}
                        className="w-24 px-3 py-2 border border-slate-300 rounded text-right font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                        disabled={saving}
                      />
                      <span className="text-sm text-slate-600 w-6">kg</span>
                      <button
                        onClick={() => handleMarkWeighedIn(athlete.id)}
                        disabled={!weights[athlete.id] || saving}
                        className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 transition-colors disabled:bg-slate-300"
                      >
                        ✓
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-slate-600">No athletes in this session</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* Progress Summary */}
          {summary && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-blue-900">
                  {summary.weighed_in} / {summary.total_athletes} Athletes
                </p>
                <span className="text-sm font-bold text-blue-700">{completionPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* No Athletes Message */}
          {athletes.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-slate-600">No athletes in this session</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors disabled:bg-slate-100"
          >
            Close
          </button>

          <div className="text-right">
            {!allWeighedIn && (
              <p className="text-xs text-slate-600 mb-2">
                {athletes.filter(a => !a.weighed_in).length} athletes remaining
              </p>
            )}
            <button
              onClick={handleCompleteWeighIn}
              disabled={!allWeighedIn || saving}
              className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition-colors disabled:bg-slate-300"
              title={!allWeighedIn ? 'All athletes must be weighed in first' : ''}
            >
              {saving ? 'Saving...' : '✅ Complete Weigh-In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
