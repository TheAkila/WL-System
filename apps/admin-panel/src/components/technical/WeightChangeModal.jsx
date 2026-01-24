import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function WeightChangeModal({ 
  athlete, 
  liftType, 
  sessionId, 
  currentWeight,
  attemptNumber,
  onClose, 
  onSuccess 
}) {
  const [newWeight, setNewWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [changeCount, setChangeCount] = useState(0);
  const [canChange, setCanChange] = useState(false);

  useEffect(() => {
    fetchWeightChangeCount();
  }, [athlete.id, liftType]);

  const fetchWeightChangeCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/athletes/${athlete.id}/weight-change-count?liftType=${liftType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangeCount(response.data.data.count);
      setCanChange(response.data.canChangeWeight);
    } catch (err) {
      console.error('Error fetching weight change count:', err);
    }
  };

  const validateWeight = () => {
    if (!newWeight || isNaN(newWeight)) {
      setError('Please enter a valid weight');
      return false;
    }

    const weight = parseInt(newWeight);
    
    if (weight <= currentWeight) {
      setError(`New weight must be higher than current weight (${currentWeight}kg)`);
      return false;
    }

    const increase = weight - currentWeight;
    if (increase < 1) {
      setError('Weight increase must be at least 1kg (IWF rule)');
      return false;
    }

    if (!canChange) {
      setError('Maximum 2 weight changes allowed per lift type (IWF rule)');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateWeight()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      await axios.post(
        `${API_URL}/api/weight-changes`,
        {
          athleteId: athlete.id,
          sessionId,
          liftType,
          attemptNumber,
          oldWeight: currentWeight,
          newWeight: parseInt(newWeight),
          requestedBy: userId,
          notes: notes.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error requesting weight change:', err);
      setError(err.response?.data?.error?.message || 'Failed to request weight change');
    } finally {
      setLoading(false);
    }
  };

  const increase = newWeight ? parseInt(newWeight) - currentWeight : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Change Weight</h2>
            <p className="text-sm text-gray-600 mt-1">
              {athlete.name} • {liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Weight Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">Current Weight</span>
              <span className="text-2xl font-bold text-blue-900">{currentWeight}kg</span>
            </div>
          </div>

          {/* New Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Weight (kg)
            </label>
            <input
              type="number"
              min={currentWeight + 1}
              step="1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="w-full px-4 py-3 text-2xl font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`${currentWeight + 1}`}
              required
            />
          </div>

          {/* Increase Display */}
          {increase > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Increase: +{increase}kg
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add any notes about this weight change..."
            />
          </div>

          {/* IWF Rules Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">IWF Rules:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Minimum increase: 1kg</li>
                  <li>Maximum 2 changes per lift type</li>
                  <li>Changes used: {changeCount}/2</li>
                  <li>Cannot decrease weight</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canChange}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Change</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
