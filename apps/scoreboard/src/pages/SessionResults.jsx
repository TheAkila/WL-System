import { useState, useEffect } from 'react';
import api from '../services/api';
import SessionResultCard from '../components/SessionResultCard';
import { FileText, Filter, Loader2, Calendar } from 'lucide-react';

export default function SessionResults() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, in-progress

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/technical/sessions/active');
      setSessions(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-black text-black mb-4 tracking-tight">
              Session Results
            </h1>
            <p className="font-body text-lg text-black">
              View detailed results from all competition sessions
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filter Tabs */}
        <div className="bg-white border border-black p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-4 px-4 font-ui font-bold transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-black hover:bg-gray-100'
              }`}
            >
              All Sessions
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`flex-1 py-4 px-4 font-ui font-bold transition-colors ${
                filter === 'in-progress'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-black hover:bg-gray-100'
              }`}
            >
              Live Now
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`flex-1 py-4 px-4 font-ui font-bold transition-colors ${
                filter === 'completed'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-black hover:bg-gray-100'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="bg-white border border-black p-12 text-center">
            <Loader2 className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
            <p className="font-body text-black text-lg">Loading sessions...</p>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <SessionResultCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-black p-12 text-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-heading text-3xl font-black text-black mb-3">
              No Sessions Found
            </h3>
            <p className="font-body text-black">
              {filter === 'completed' && 'No completed sessions yet'}
              {filter === 'in-progress' && 'No live sessions right now'}
              {filter === 'all' && 'No sessions available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
