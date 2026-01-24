import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Play, Pause } from 'lucide-react';

export default function SessionControls({ session, onUpdate, showLiftSwitch = true }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status) => {
    setLoading(true);
    try {
      console.log('📋 Updating session status:', { sessionId: session.id, status });
      const response = await api.put(`/technical/sessions/${session.id}/status`, {
        status,
      });
      console.log('✅ Session status updated:', response.data);
      onUpdate(response.data.data);
      toast.success(`Session ${status === 'in-progress' ? 'started' : status}`);
    } catch (error) {
      console.error('❌ Failed to update session:', error);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update session';
      toast.error(errorMessage);
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
          <button
            onClick={() => updateStatus('completed')}
            disabled={loading}
            className="btn btn-danger flex items-center gap-2"
          >
            <Pause size={18} />
            End Session
          </button>
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
