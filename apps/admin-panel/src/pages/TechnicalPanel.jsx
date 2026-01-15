import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import { Monitor, RotateCw } from 'lucide-react';
import SessionSelector from '../components/technical/SessionSelector';
import LiftingOrder from '../components/technical/LiftingOrder';
import AttemptControl from '../components/technical/AttemptControl';
import CurrentLiftDisplay from '../components/technical/CurrentLiftDisplay';
import SessionControls from '../components/technical/SessionControls';

export default function TechnicalPanel() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [liftingOrder, setLiftingOrder] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socketService.connect();

    // Listen for attempt updates
    socketService.on('attempt:created', (attempt) => {
      if (attempt.session_id === selectedSession?.id) {
        setCurrentAttempt(attempt);
        fetchLiftingOrder();
        toast.success(`Attempt declared: ${attempt.athlete?.name} - ${attempt.weight}kg`);
      }
    });

    socketService.on('attempt:validated', (attempt) => {
      if (attempt.session_id === selectedSession?.id) {
        const result = attempt.result === 'good' ? '✓ GOOD LIFT' : '✗ NO LIFT';
        toast.success(`${attempt.athlete?.name}: ${result}`);
        setCurrentAttempt(null);
        fetchLiftingOrder();
        fetchLeaderboard();
      }
    });

    socketService.on('session:updated', (session) => {
      if (session.id === selectedSession?.id) {
        setSelectedSession(session);
      }
    });

    socketService.on('leaderboard:updated', (updatedLeaderboard) => {
      if (selectedSession) {
        setLeaderboard(updatedLeaderboard);
        console.log('Leaderboard updated:', updatedLeaderboard.length, 'athletes');
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [selectedSession]);

  const fetchLiftingOrder = async () => {
    if (!selectedSession) return;

    try {
      const response = await api.get(`/technical/sessions/${selectedSession.id}/lifting-order`);
      setLiftingOrder(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch lifting order:', error);
    }
  };

  const fetchCurrentAttempt = async () => {
    if (!selectedSession) return;

    try {
      const response = await api.get(`/technical/sessions/${selectedSession.id}/current-attempt`);
      setCurrentAttempt(response.data.data);
    } catch (error) {
      console.error('Failed to fetch current attempt:', error);
    }
  };

  const fetchLeaderboard = async () => {
    if (!selectedSession) return;

    try {
      const response = await api.get(`/technical/sessions/${selectedSession.id}/leaderboard`);
      setLeaderboard(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const handleMedalUpdate = async (athleteId, medal) => {
    try {
      setLoading(true);
      await api.put(`/technical/athletes/${athleteId}/medal`, { medal });
      toast.success(medal ? `${medal.toUpperCase()} medal assigned` : 'Medal removed');
      await fetchLeaderboard();
    } catch (error) {
      console.error('Failed to update medal:', error);
      toast.error('Failed to update medal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      fetchLiftingOrder();
      fetchCurrentAttempt();
      fetchLeaderboard();
      socketService.joinSession(selectedSession.id);
    }

    return () => {
      if (selectedSession) {
        socketService.leaveSession(selectedSession.id);
      }
    };
  }, [selectedSession]);

  const handleDeclareAttempt = async (athleteId, weight) => {
    setLoading(true);
    try {
      await api.post('/technical/attempts/declare', {
        athleteId,
        weight,
      });
      // Socket will handle the update
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to declare attempt');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDecision = async (decision) => {
    if (!currentAttempt) {
      toast.error('No attempt in progress');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/technical/attempts/${currentAttempt.id}/quick-decision`, {
        decision,
      });
      // Socket will handle the update
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to record decision');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSession) {
    return (
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-black text-white rounded-lg">
              <Monitor size={32} />
            </div>
            <div>
              <h1 className="font-heading text-5xl font-black text-black">TECHNICAL PANEL</h1>
              <p className="font-ui text-sm font-bold text-gray-600 uppercase tracking-widest mt-2">Live competition control</p>
            </div>
          </div>
        </div>
        <div className="card">
          <SessionSelector onSelectSession={setSelectedSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with session info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-black text-black">{selectedSession.name}</h1>
          <p className="font-ui text-sm font-bold text-gray-600 uppercase tracking-widest mt-2">
            {selectedSession.gender === 'male' ? 'Men' : 'Women'} • {selectedSession.weight_category}kg
          </p>
        </div>
        <button
          onClick={() => setSelectedSession(null)}
          className="btn btn-secondary"
        >
          <RotateCw size={20} />
          <span>Change Session</span>
        </button>
      </div>

      {/* Session Controls */}
      <SessionControls session={selectedSession} onUpdate={setSelectedSession} />

      {/* Current Lift Display */}
      <CurrentLiftDisplay session={selectedSession} />

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Lifting Order */}
        <div className="card">
          <h2 className="font-heading text-2xl font-black text-black mb-6 uppercase tracking-widest">Lifting Order</h2>
          <LiftingOrder
            athletes={liftingOrder}
            currentAttempt={currentAttempt}
            onDeclareAttempt={handleDeclareAttempt}
            loading={loading}
          />
        </div>

        {/* Right: Attempt Control */}
        <div className="card">
          <h2 className="font-heading text-2xl font-black text-black mb-6 uppercase tracking-widest">Attempt Control</h2>
          <AttemptControl
            currentAttempt={currentAttempt}
            onGoodLift={() => handleQuickDecision('good')}
            onNoLift={() => handleQuickDecision('no-lift')}
            loading={loading}
          />
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h2 className="font-heading text-2xl font-black text-black mb-6 uppercase tracking-widest">Current Standings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b-4 border-black">
                <th className="text-left py-4 font-heading font-black text-black">Rank</th>
                <th className="text-left py-4 font-heading font-black text-black">Medal</th>
                <th className="text-left py-4 font-heading font-black text-black">Name</th>
                <th className="text-left py-4 font-heading font-black text-black">Country</th>
                <th className="text-right py-4 font-heading font-black text-black">Snatch</th>
                <th className="text-right py-4 font-heading font-black text-black">C&J</th>
                <th className="text-right py-4 font-heading font-black text-black">Total</th>
                <th className="text-center py-4 font-heading font-black text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((athlete) => (
                <tr key={athlete.athlete_id} className="border-b border-gray-300 hover:bg-gray-100">
                  <td className="py-4 font-heading font-bold text-black">{athlete.rank || '-'}</td>
                  <td className="py-4 text-2xl">
                    {athlete.medal === 'gold' && '🥇'}
                    {athlete.medal === 'silver' && '🥈'}
                    {athlete.medal === 'bronze' && '🥉'}
                  </td>
                  <td className="py-4 font-heading font-bold text-black">{athlete.athlete_name}</td>
                  <td className="py-4 font-ui font-bold text-black">{athlete.country}</td>
                  <td className="py-4 text-right font-heading font-bold text-black">{athlete.best_snatch || '-'}</td>
                  <td className="py-4 text-right font-heading font-bold text-black">{athlete.best_clean_and_jerk || '-'}</td>
                  <td className="py-4 text-right font-heading text-2xl font-black text-black">{athlete.total || 0}</td>
                  <td className="py-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleMedalUpdate(athlete.athlete_id, 'gold')}
                        className={`px-3 py-2 rounded-lg text-xl transition-all ${
                          athlete.medal === 'gold'
                            ? 'bg-black text-white border-2 border-black'
                            : 'bg-gray-100 border-2 border-black hover:bg-gray-200'
                        } disabled:opacity-50`}
                        disabled={loading}
                        title="Assign Gold"
                      >
                        🥇
                      </button>
                      <button
                        onClick={() => handleMedalUpdate(athlete.athlete_id, 'silver')}
                        className={`px-3 py-2 rounded-lg text-xl transition-all ${
                          athlete.medal === 'silver'
                            ? 'bg-black text-white border-2 border-black'
                            : 'bg-gray-100 border-2 border-black hover:bg-gray-200'
                        } disabled:opacity-50`}
                        disabled={loading}
                        title="Assign Silver"
                      >
                        🥈
                      </button>
                      <button
                        onClick={() => handleMedalUpdate(athlete.athlete_id, 'bronze')}
                        className={`px-3 py-2 rounded-lg text-xl transition-all ${
                          athlete.medal === 'bronze'
                            ? 'bg-black text-white border-2 border-black'
                            : 'bg-gray-100 border-2 border-black hover:bg-gray-200'
                        } disabled:opacity-50`}
                        disabled={loading}
                        title="Assign Bronze"
                      >
                        🥉
                      </button>
                      {athlete.medal && (
                        <button
                          onClick={() => handleMedalUpdate(athlete.athlete_id, null)}
                          className="px-3 py-2 rounded-lg bg-gray-100 border-2 border-black hover:bg-red-100 transition-all disabled:opacity-50 font-heading font-bold"
                          disabled={loading}
                          title="Remove Medal"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
