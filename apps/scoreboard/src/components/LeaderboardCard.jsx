import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardCard({ athlete, position }) {
  const rank = athlete.rank || position || 0;
  const medal = athlete.medal;
  
  const getMedalConfig = () => {
    if (medal === 'gold' || rank === 1) {
      return { 
        icon: Trophy, 
        border: 'border-slate-900 dark:border-slate-700',
        text: 'text-slate-900 dark:text-white',
        iconBg: 'bg-slate-900 dark:bg-slate-700'
      };
    }
    if (medal === 'silver' || rank === 2) {
      return { 
        icon: Medal, 
        border: 'border-slate-400 dark:border-zinc-600',
        text: 'text-slate-600 dark:text-zinc-400',
        iconBg: 'bg-slate-400 dark:bg-zinc-600'
      };
    }
    if (medal === 'bronze' || rank === 3) {
      return { 
        icon: Award, 
        border: 'border-slate-600 dark:border-zinc-500',
        text: 'text-slate-600 dark:text-zinc-400',
        iconBg: 'bg-slate-600 dark:bg-zinc-500'
      };
    }
    return { 
      icon: null, 
      border: 'border-slate-200 dark:border-zinc-700',
      text: 'text-slate-900 dark:text-white',
      iconBg: 'bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700'
    };
  };

  const config = getMedalConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-white dark:bg-zinc-900 border-2 ${config.border} overflow-hidden hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-black/40 transition-all rounded-lg`}>
      <div className="flex items-center gap-4 p-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 ${config.iconBg} flex items-center justify-center rounded-lg`}>
            {Icon ? (
              <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
            ) : (
              <span className="font-heading text-3xl font-black text-slate-900 dark:text-white">
                {rank}
              </span>
            )}
          </div>
        </div>

        {/* Athlete Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate mb-1 tracking-tight">
            {athlete.athlete_name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-ui text-sm font-semibold text-slate-600 dark:text-zinc-400">
              {athlete.country}
            </span>
            {athlete.body_weight && (
              <>
                <span className="text-slate-300 dark:text-zinc-600">•</span>
                <span className="font-ui text-sm text-slate-600 dark:text-zinc-400">
                  {athlete.body_weight}kg
                </span>
              </>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="text-right">
          <div className={`font-heading text-5xl sm:text-6xl font-black ${config.text}`}>
            {athlete.total || 0}
          </div>
          <div className="font-ui text-xs font-bold text-slate-600 dark:text-zinc-400 uppercase tracking-widest">
            KG
          </div>
        </div>
      </div>

      {/* Lift Breakdown */}
      <div className="bg-slate-50 dark:bg-zinc-800 border-t-2 border-slate-200 dark:border-zinc-700 px-6 py-4 grid grid-cols-2 divide-x-2 divide-slate-200 dark:divide-zinc-700">
        <div className="text-center pr-4">
          <div className="font-ui text-xs text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-1 font-bold">
            Snatch
          </div>
          <div className="font-heading text-3xl font-black text-slate-900 dark:text-white">
            {athlete.best_snatch || 0}
          </div>
        </div>
        <div className="text-center pl-4">
          <div className="font-ui text-xs text-slate-600 dark:text-zinc-400 uppercase tracking-widest mb-1 font-bold">
            Clean & Jerk
          </div>
          <div className="font-heading text-3xl font-black text-slate-900 dark:text-white">
            {athlete.best_clean_and_jerk || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
