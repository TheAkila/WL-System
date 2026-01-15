import { Trophy, Medal, Award } from 'lucide-react';

export default function LeaderboardCard({ athlete, position }) {
  const rank = athlete.rank || position || 0;
  const medal = athlete.medal;
  
  const getMedalConfig = () => {
    if (medal === 'gold' || rank === 1) {
      return { 
        icon: Trophy, 
        border: 'border-black',
        text: 'text-black',
        iconBg: 'bg-black'
      };
    }
    if (medal === 'silver' || rank === 2) {
      return { 
        icon: Medal, 
        border: 'border-gray-400',
        text: 'text-gray-600',
        iconBg: 'bg-gray-400'
      };
    }
    if (medal === 'bronze' || rank === 3) {
      return { 
        icon: Award, 
        border: 'border-gray-600',
        text: 'text-gray-600',
        iconBg: 'bg-gray-600'
      };
    }
    return { 
      icon: null, 
      border: 'border-black',
      text: 'text-black',
      iconBg: 'bg-white border-2 border-black'
    };
  };

  const config = getMedalConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-white border-2 ${config.border} overflow-hidden hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-4 p-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 ${config.iconBg} flex items-center justify-center`}>
            {Icon ? (
              <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
            ) : (
              <span className="font-heading text-3xl font-black text-black">
                {rank}
              </span>
            )}
          </div>
        </div>

        {/* Athlete Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-heading text-2xl sm:text-3xl font-black text-black truncate mb-1 tracking-tight">
            {athlete.athlete_name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-ui text-sm font-semibold text-black">
              {athlete.country}
            </span>
            {athlete.body_weight && (
              <>
                <span className="text-gray-400">•</span>
                <span className="font-ui text-sm text-gray-600">
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
          <div className="font-ui text-xs font-bold text-gray-600 uppercase tracking-widest">
            KG
          </div>
        </div>
      </div>

      {/* Lift Breakdown */}
      <div className="bg-gray-100 border-t-2 border-black px-6 py-4 grid grid-cols-2 divide-x-2 divide-black">
        <div className="text-center pr-4">
          <div className="font-ui text-xs text-black uppercase tracking-widest mb-1 font-bold">
            Snatch
          </div>
          <div className="font-heading text-3xl font-black text-black">
            {athlete.best_snatch || 0}
          </div>
        </div>
        <div className="text-center pl-4">
          <div className="font-ui text-xs text-black uppercase tracking-widest mb-1 font-bold">
            Clean & Jerk
          </div>
          <div className="font-heading text-3xl font-black text-black">
            {athlete.best_clean_and_jerk || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
