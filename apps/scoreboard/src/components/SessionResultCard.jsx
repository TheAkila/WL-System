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
          bg: 'bg-slate-900 dark:bg-slate-700', 
          text: 'text-white'
        };
      case 'completed':
        return { 
          label: 'Completed', 
          bg: 'bg-slate-600 dark:bg-zinc-600', 
          text: 'text-white'
        };
      case 'scheduled':
        return { 
          label: 'Scheduled', 
          bg: 'bg-slate-100 dark:bg-zinc-800', 
          text: 'text-slate-900 dark:text-white'
        };
      default:
        return { 
          label: session.status, 
          bg: 'bg-slate-100 dark:bg-zinc-800', 
          text: 'text-slate-900 dark:text-white'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-700 overflow-hidden rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-white transition-colors tracking-tight">
              {session.name}
            </h3>
            <span className={`${statusConfig.bg} ${statusConfig.text} px-4 py-2 text-xs font-ui font-bold uppercase tracking-widest rounded`}>
              {statusConfig.label}
            </span>
          </div>
          <div className="font-ui text-sm text-slate-600 dark:text-zinc-400 flex items-center gap-2">
            <span>{session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg</span>
            {session.current_lift && (
              <>
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                <span>{session.current_lift === 'snatch' ? 'Snatch' : 'Clean & Jerk'}</span>
              </>
            )}
          </div>
          {session.competition && (
            <p className="font-body text-xs text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {session.competition.name}
            </p>
          )}
        </div>
        <div className="ml-4">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t-2 border-slate-200 dark:border-zinc-700 p-6 bg-slate-50 dark:bg-zinc-800">
          <div className="space-y-4">
            {/* Session Details */}
            <div className="grid grid-cols-2 gap-4 font-ui text-sm">
              {session.start_time && (
                <div>
                  <div className="text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Start Time
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {new Date(session.start_time).toLocaleString()}
                  </div>
                </div>
              )}
              {session.end_time && (
                <div>
                  <div className="text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5 font-bold uppercase tracking-widest text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    End Time
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
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
                  className="flex-1 py-4 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Watch Live
                </Link>
              )}
              <Link
                to={`/leaderboard?session=${session.id}`}
                className="flex-1 py-4 btn btn-secondary flex items-center justify-center gap-2"
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
