import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Monitor } from 'lucide-react';
import SessionSelector from '../components/technical/SessionSelector';
import SessionSheet from '../components/technical/SessionSheet';
import socketService from '../services/socket';

export default function TechnicalPanel() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSession) {
    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-red-600 text-white rounded-xl">
              <Monitor size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white">Technical Panel</h1>
              <p className="text-slate-600 dark:text-zinc-400 font-ui mt-1">Competition sheet management system</p>
            </div>
          </div>
        </div>
        <div className="card card-lg">
          <SessionSelector 
            sessions={sessions}
            onSelectSession={setSelectedSession}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SessionSheet session={selectedSession} onBack={() => setSelectedSession(null)} />
    </div>
  );
}
