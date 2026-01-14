import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Play, Pause, SkipForward } from 'lucide-react';

export default function SessionControls({ session, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status) => {
    setLoading(true);
    try {
      const response = await api.put(`/technical/sessions/${session.id}/status`, {
        status,
      });
      onUpdate(response.data.data);
      toast.success(`Session ${status}`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update session');
    } finally {
      setLoading(false);
    }
  };

  const changeLift = async (liftType) => {
    setLoading(true);
    try {
      const response = await api.put(`/technical/sessions/${session.id}/lift-type`, {
        liftType,
      });
      onUpdate(response.data.data);
      toast.success(`Changed to ${liftType === 'snatch' ? 'Snatch' : 'Clean & Jerk'}`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to change lift type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">Session Controls</h3>
      <div className="flex flex-wrap gap-3">
        {session.status === 'scheduled' && (
          <button
            onClick={() => updateStatus('in-progress')}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Play size={18} />
            Start Session
          </button>
        )}

        {session.status === 'in-progress' && (
          <>
            <button
              onClick={() => updateStatus('completed')}
              disabled={loading}
              className="btn btn-danger flex items-center gap-2"
            >
              <Pause size={18} />
              End Session
            </button>

            {session.current_lift === 'snatch' && (
              <button
                onClick={() => changeLift('clean_and_jerk')}
                disabled={loading}
                className="btn btn-secondary flex items-center gap-2"
              >
                <SkipForward size={18} />
                Switch to Clean & Jerk
              </button>
            )}

            {session.current_lift === 'clean_and_jerk' && (
              <button
                onClick={() => changeLift('snatch')}
                disabled={loading}
                className="btn btn-secondary flex items-center gap-2"
              >
                <SkipForward size={18} />
                Switch to Snatch
              </button>
            )}
          </>
        )}

        {session.status === 'completed' && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-semibold">
            ✓ Session Completed
          </div>
        )}
      </div>
    </div>
  );
}
