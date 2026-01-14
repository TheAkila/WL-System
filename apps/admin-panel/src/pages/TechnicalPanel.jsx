import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
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
        <h1 className="text-3xl font-bold mb-8">Technical Panel</h1>
        <SessionSelector onSelectSession={setSelectedSession} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with session info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{selectedSession.name}</h1>
          <p className="text-gray-600 mt-1">
            {selectedSession.gender === 'male' ? 'Men' : 'Women'} •{' '}
            {selectedSession.weight_category}kg
          </p>
        </div>
        <button
          onClick={() => setSelectedSession(null)}
          className="btn btn-secondary"
        >
          Change Session
        </button>
      </div>

      {/* Session Controls */}
      <SessionControls session={selectedSession} onUpdate={setSelectedSession} />

      {/* Current Lift Display */}
      <CurrentLiftDisplay session={selectedSession} />

      {/* Main Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Lifting Order */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Lifting Order</h2>
          <LiftingOrder
            athletes={liftingOrder}
            currentAttempt={currentAttempt}
            onDeclareAttempt={handleDeclareAttempt}
            loading={loading}
          />
        </div>

        {/* Right: Attempt Control */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Attempt Control</h2>
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
        <h2 className="text-2xl font-bold mb-4">Current Standings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Rank</th>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Country</th>
                <th className="text-right py-2">Snatch</th>
                <th className="text-right py-2">C&J</th>
                <th className="text-right py-2 font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((athlete) => (
                <tr key={athlete.athlete_id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-bold">{athlete.rank || '-'}</td>
                  <td className="py-2">{athlete.athlete_name}</td>
                  <td className="py-2">{athlete.country}</td>
                  <td className="py-2 text-right">{athlete.best_snatch || '-'}</td>
                  <td className="py-2 text-right">{athlete.best_clean_and_jerk || '-'}</td>
                  <td className="py-2 text-right font-bold">{athlete.total || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
