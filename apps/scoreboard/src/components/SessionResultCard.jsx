import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SessionResultCard({ session }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (session.status) {
      case 'in-progress':
        return <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full font-semibold">🔴 LIVE</span>;
      case 'completed':
        return <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full font-semibold">✓ Completed</span>;
      case 'scheduled':
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-full font-semibold">Scheduled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-bold text-gray-900">{session.name}</h3>
            {getStatusBadge()}
          </div>
          <div className="text-sm text-gray-600">
            {session.gender === 'male' ? '🚹 Men' : '🚺 Women'} {session.weight_category}kg
            {session.current_lift && ` • ${session.current_lift === 'snatch' ? 'Snatch' : 'Clean & Jerk'}`}
          </div>
          {session.competition && (
            <p className="text-xs text-gray-500 mt-1">{session.competition.name}</p>
          )}
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <div className="border-t p-4 bg-gray-50">
          <div className="space-y-3">
            {/* Session Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {session.start_time && (
                <div>
                  <div className="text-gray-500">Start Time</div>
                  <div className="font-semibold">
                    {new Date(session.start_time).toLocaleString()}
                  </div>
                </div>
              )}
              {session.end_time && (
                <div>
                  <div className="text-gray-500">End Time</div>
                  <div className="font-semibold">
                    {new Date(session.end_time).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {session.status === 'in-progress' && (
                <Link
                  to={`/live?session=${session.id}`}
                  className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Watch Live
                </Link>
              )}
              <Link
                to={`/leaderboard?session=${session.id}`}
                className="flex-1 py-2 bg-purple-600 text-white text-center rounded-lg font-medium hover:bg-purple-700 transition"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
