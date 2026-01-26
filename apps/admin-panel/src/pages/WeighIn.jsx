import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function WeighIn() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchAthletes();
    }
  }, [selectedSession]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load sessions');
    }
  };

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      // Use session endpoint to get all athletes in this session
      // This properly supports both single-class and multi-class sessions
      const response = await api.get(`/sessions/${selectedSession.id}/athletes`);
      
      if (response.data.success) {
        setAthletes(response.data.athletes || []);
      } else {
        setAthletes([]);
        toast.error('Failed to load athletes');
      }
    } catch (error) {
      toast.error('Failed to load athletes');
      console.error('Error fetching athletes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWeighIn = async (athleteId, weighInData) => {
    if (!weighInData.body_weight || weighInData.body_weight <= 0) {
      toast.error('Please enter a valid body weight');
      return;
    }
    if (!weighInData.opening_snatch || weighInData.opening_snatch <= 0) {
      toast.error('Please enter opening snatch attempt');
      return;
    }
    if (!weighInData.opening_clean_jerk || weighInData.opening_clean_jerk <= 0) {
      toast.error('Please enter opening clean & jerk attempt');
      return;
    }

    try {
      await api.put(`/athletes/${athleteId}`, {
        ...weighInData,
        session_id: selectedSession.id,
        weigh_in_completed_at: new Date().toISOString(),
      });
      toast.success('Weigh-in completed successfully');
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to complete weigh-in');
      console.error(error);
    }
  };

  const handleAssignLotNumbers = async () => {
    if (!confirm('Assign random lot numbers to all athletes in this session?')) return;

    try {
      const athletesNeedingLots = athletes.filter(a => !a.lot_number && a.weigh_in_completed_at);
      
      if (athletesNeedingLots.length === 0) {
        toast.error('No athletes have completed weigh-in yet');
        return;
      }

      const lotNumbers = athletesNeedingLots.map((_, i) => i + 1);
      
      for (let i = lotNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lotNumbers[i], lotNumbers[j]] = [lotNumbers[j], lotNumbers[i]];
      }

      await Promise.all(
        athletesNeedingLots.map((athlete, index) =>
          api.put(`/athletes/${athlete.id}`, { lot_number: lotNumbers[index] })
        )
      );

      toast.success('Lot numbers assigned successfully');
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to assign lot numbers');
      console.error(error);
    }
  };

  const handleClearWeighIn = async (athleteId) => {
    if (!confirm('Clear weigh-in data for this athlete?')) return;

    try {
      await api.put(`/athletes/${athleteId}`, {
        body_weight: null,
        opening_snatch: null,
        opening_clean_jerk: null,
        lot_number: null,
        weigh_in_completed_at: null,
      });
      toast.success('Weigh-in cleared');
      fetchAthletes();
    } catch (error) {
      toast.error('Failed to clear weigh-in');
    }
  };

  const filteredAthletes = athletes.filter((a) =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const weighedIn = filteredAthletes.filter((a) => a.weigh_in_completed_at).length;
  const totalAthletes = filteredAthletes.length;
  const progressPercent = totalAthletes > 0 ? (weighedIn / totalAthletes) * 100 : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">
          Official Weigh-In
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 font-ui">
          Record body weight and opening attempt declarations • Athletes must make their weight category or will be disqualified
        </p>
      </div>

      

      {!selectedSession ? (
        <div className="card card-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              Select Session
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className="p-6 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left"
              >
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {session.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  {session.gender === 'male' ? 'Men' : 'Women'} • {
                    session.weight_classes && session.weight_classes.length > 0
                      ? session.weight_classes.map(wc => `${wc}kg`).join(' / ')
                      : `${session.weight_category}kg`
                  }
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="card mb-6 p-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                {selectedSession.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                {selectedSession.gender === 'male' ? 'Men' : 'Women'} • {
                  selectedSession.weight_classes && selectedSession.weight_classes.length > 0
                    ? selectedSession.weight_classes.map(wc => `${wc}kg`).join(' / ')
                    : `${selectedSession.weight_category}kg`
                }
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAssignLotNumbers}
                className="btn btn-secondary"
              >
                Assign Lot Numbers
              </button>
              <button onClick={() => setSelectedSession(null)} className="btn btn-secondary">
                Change Session
              </button>
            </div>
          </div>

          <div className="card mb-4 p-3">
            <div className="flex items-center justify-between mb-2 gap-3">
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Progress</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{weighedIn}/{totalAthletes}</span>
            </div>
            <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-slate-900 dark:bg-slate-950 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="card mb-6 p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search athletes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="card card-lg text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredAthletes.length === 0 ? (
              <div className="card card-lg text-center py-12">
                <p className="text-slate-600 dark:text-zinc-400">No athletes found</p>
              </div>
            ) : (
              filteredAthletes.map((athlete) => (
                <WeighInRow
                  key={athlete.id}
                  athlete={athlete}
                  onComplete={handleCompleteWeighIn}
                  onClear={handleClearWeighIn}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WeighInRow({ athlete, onComplete, onClear }) {
  const [isEditing, setIsEditing] = useState(!athlete.weigh_in_completed_at);
  const [formData, setFormData] = useState({
    body_weight: athlete.body_weight || '',
    opening_snatch: athlete.opening_snatch || '',
    opening_clean_jerk: athlete.opening_clean_jerk || '',
  });

  // Weight category validation
  const getWeightCategoryLimits = (category, gender) => {
    const categories = {
      male: {
        '60': { min: 0, max: 60 },
        '65': { min: 60.01, max: 65 },
        '71': { min: 65.01, max: 71 },
        '79': { min: 71.01, max: 79 },
        '88': { min: 79.01, max: 88 },
        '94': { min: 88.01, max: 94 },
        '110': { min: 94.01, max: 110 },
        '110+': { min: 110.01, max: Infinity }
      },
      female: {
        '48': { min: 0, max: 48 },
        '53': { min: 48.01, max: 53 },
        '58': { min: 53.01, max: 58 },
        '63': { min: 58.01, max: 63 },
        '69': { min: 63.01, max: 69 },
        '77': { min: 69.01, max: 77 },
        '86': { min: 77.01, max: 86 },
        '86+': { min: 86.01, max: Infinity }
      }
    };
    return categories[gender]?.[category] || null;
  };

  const validateWeight = (weight) => {
    if (!weight || !athlete.weight_category) return null;
    const limits = getWeightCategoryLimits(athlete.weight_category, athlete.gender);
    if (!limits) return null;
    
    const bodyWeight = parseFloat(weight);
    if (bodyWeight > limits.max) {
      return {
        valid: false,
        message: `⚠️ OVERWEIGHT: ${bodyWeight}kg exceeds ${athlete.weight_category}kg category (max ${limits.max}kg). Athlete will be DISQUALIFIED.`,
        type: 'error'
      };
    }
    if (bodyWeight < limits.min) {
      return {
        valid: false,
        message: `⚠️ UNDERWEIGHT: ${bodyWeight}kg is below ${athlete.weight_category}kg category minimum (${limits.min}kg).`,
        type: 'warning'
      };
    }
    return { valid: true, message: '✓ Weight within category limits', type: 'success' };
  };

  const weightValidation = formData.body_weight ? validateWeight(formData.body_weight) : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check weight validation
    if (weightValidation && !weightValidation.valid && weightValidation.type === 'error') {
      if (!confirm(`${weightValidation.message}\n\nAre you sure you want to proceed? This athlete will be disqualified.`)) {
        return;
      }
    }
    
    onComplete(athlete.id, {
      body_weight: parseFloat(formData.body_weight),
      opening_snatch: parseInt(formData.opening_snatch),
      opening_clean_jerk: parseInt(formData.opening_clean_jerk),
    });
    setIsEditing(false);
  };

  const isCompleted = athlete.weigh_in_completed_at;

  return (
    <div className={`card p-6 border-2 transition-all text-left rounded-xl ${
        isCompleted
          ? 'border-slate-300 bg-slate-50 dark:border-zinc-600 dark:bg-zinc-900/30'
          : 'border-slate-200 hover:border-blue-400 dark:border-zinc-700 dark:hover:border-blue-600'
      } hover:bg-blue-50/50 dark:hover:bg-blue-900/10`}>
      
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white mb-3">
              {athlete.name}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Body Weight (kg) *
              </label>
              <input type="number" step="0.01" min="1" required placeholder="70.50"
                value={formData.body_weight}
                onChange={(e) => setFormData({ ...formData, body_weight: e.target.value })}
                className="input text-sm" />
              {weightValidation && (
                <div className={`mt-1 p-1.5 text-xs font-medium rounded ${
                  weightValidation.type === 'error' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700' 
                    : weightValidation.type === 'warning'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                }`}>
                  {weightValidation.message}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Opening Snatch (kg) *
              </label>
              <input type="number" min="1" required placeholder="100"
                value={formData.opening_snatch}
                onChange={(e) => setFormData({ ...formData, opening_snatch: e.target.value })}
                className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-zinc-300 mb-1">
                Opening C&J (kg) *
              </label>
              <input type="number" min="1" required placeholder="120"
                value={formData.opening_clean_jerk}
                onChange={(e) => setFormData({ ...formData, opening_clean_jerk: e.target.value })}
                className="input text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm">
              Complete Weigh-In
            </button>
            {isCompleted && <button type="button" onClick={() => setIsEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>}
            {isCompleted && <button type="button" onClick={() => onClear(athlete.id)} className="btn bg-red-100 text-red-600 hover:bg-red-200 btn-sm">
              Clear
            </button>}
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {athlete.start_number} {athlete.name}
              </h3>
              {isCompleted && <span className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded">COMPLETED</span>}
            </div>
            <p className="text-sm text-slate-600 dark:text-zinc-400">
              {athlete.weight_category}kg • {athlete.team?.name || 'N/A'}
            </p>
          </div>
          
          <div className="flex gap-3 text-xs">
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white">{athlete.body_weight || '-'}</div>
              <div className="text-slate-500 dark:text-zinc-400">BW</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white">{athlete.opening_snatch || '-'}</div>
              <div className="text-slate-500 dark:text-zinc-400">Snatch</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white">{athlete.opening_clean_jerk || '-'}</div>
              <div className="text-slate-500 dark:text-zinc-400">C&J</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-white">{athlete.lot_number || '-'}</div>
              <div className="text-slate-500 dark:text-zinc-400">Lot</div>
            </div>
          </div>
          
          <button onClick={() => setIsEditing(true)} className="p-2 border border-slate-300 dark:border-zinc-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
            <svg className="w-4 h-4 text-slate-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
