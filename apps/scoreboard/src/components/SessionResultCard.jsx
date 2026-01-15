import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, Trophy, Clock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SessionResultCard({ session }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusConfig = () => {
    switch (session.status) {
      case 'in-progress':
        return { 
          label: 'LIVE NOW', 
          bg: 'bg-black', 
          text: 'text-white'
        };
      case 'completed':
        return { 
          label: 'Completed', 
          bg: 'bg-gray-600', 
          text: 'text-white'
        };
      case 'scheduled':
        return { 
          label: 'Scheduled', 
          bg: 'bg-gray-200', 
          text: 'text-black'
        };
      default:
        return { 
          label: session.status, 
          bg: 'bg-gray-200', 
          text: 'text-black'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white border-2 border-black overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-xl font-black text-black group-hover:text-black transition-colors tracking-tight">
              {session.name}
            </h3>
            <span className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 text-xs font-ui font-bold uppercase tracking-widest`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="font-ui text-sm text-black flex items-center gap-2">
            <span>{session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg</span>
            {session.current_lift && (
              <>
                <span className="text-gray-400">•</span>
                <span>{session.current_lift === 'snatch' ? 'Snatch' : 'Clean & Jerk'}</span>
              </>
            )}
          </div>
          {session.competition && (
            <p className="font-body text-xs text-gray-600 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {session.competition.name}
            </p>
          )}
        </div>
        <div className="ml-4">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-black group-hover:text-black transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-black group-hover:text-black transition-colors" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t-2 border-black p-6 bg-gray-50">
          <div className="space-y-4">
            {/* Session Details */}
            <div className="grid grid-cols-2 gap-4 font-ui text-sm">
              {session.start_time && (
                <div>
                  <div className="text-gray-600 mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Start Time
                  </div>
                  <div className="font-bold text-black">
                    {new Date(session.start_time).toLocaleString()}
                  </div>
                </div>
              )}
              {session.end_time && (
                <div>
                  <div className="text-gray-600 mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    End Time
                  </div>
                  <div className="font-bold text-black">
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
                  className="flex-1 py-4 bg-black text-white text-center font-ui font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Watch Live
                </Link>
              )}
              <Link
                to={`/leaderboard?session=${session.id}`}
                className="flex-1 py-4 bg-white border-2 border-black text-black text-center font-ui font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                View Rankings
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
