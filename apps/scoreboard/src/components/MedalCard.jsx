import { Trophy, Medal, Award } from 'lucide-react';

export default function MedalCard({ country, rank }) {
  const { country: name, gold, silver, bronze, total } = country;

  const getRankConfig = () => {
    if (rank === 1) return { 
      icon: Trophy, 
      border: 'border-slate-900 dark:border-slate-700'
    };
    if (rank === 2) return { 
      icon: Medal, 
      border: 'border-slate-400 dark:border-zinc-600'
    };
    if (rank === 3) return { 
      icon: Award, 
      border: 'border-slate-600 dark:border-zinc-500'
    };
    return { 
      icon: null, 
      border: 'border-slate-200 dark:border-zinc-700'
    };
  };

  const config = getRankConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-white dark:bg-zinc-900 border-2 ${config.border} overflow-hidden hover:shadow-lg dark:hover:shadow-lg dark:hover:shadow-black/40 transition-all rounded-lg`}>
      <div className="flex items-center gap-4 p-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-slate-900 dark:bg-slate-700 flex items-center justify-center rounded-lg">
            {Icon ? (
              <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
            ) : (
              <span className="font-heading text-3xl font-black text-white">
                {rank}
              </span>
            )}
          </div>
        </div>

        {/* Country */}
        <div className="flex-1">
          <h3 className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{name}</h3>
          <p className="font-ui text-sm font-semibold text-slate-600 dark:text-zinc-400">
            {total} medal{total !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Medal Counts */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-900 dark:bg-slate-700 flex items-center justify-center mb-2 rounded-lg">
              <Trophy className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-slate-900 dark:text-white">{gold}</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-400 dark:bg-zinc-600 flex items-center justify-center mb-2 rounded-lg">
              <Medal className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-slate-600 dark:text-zinc-400">{silver}</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-slate-600 dark:bg-zinc-500 flex items-center justify-center mb-2 rounded-lg">
              <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-slate-600 dark:text-zinc-400">{bronze}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
