import { Trophy, Medal, Award } from 'lucide-react';

export default function MedalCard({ country, rank }) {
  const { country: name, gold, silver, bronze, total } = country;

  const getRankConfig = () => {
    if (rank === 1) return { 
      icon: Trophy, 
      border: 'border-black'
    };
    if (rank === 2) return { 
      icon: Medal, 
      border: 'border-gray-400'
    };
    if (rank === 3) return { 
      icon: Award, 
      border: 'border-gray-600'
    };
    return { 
      icon: null, 
      border: 'border-black'
    };
  };

  const config = getRankConfig();
  const Icon = config.icon;

  return (
    <div className={`bg-white border-2 ${config.border} overflow-hidden hover:shadow-lg transition-all`}>
      <div className="flex items-center gap-4 p-6">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-black flex items-center justify-center">
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
          <h3 className="font-heading text-3xl sm:text-4xl font-black text-black mb-1 tracking-tight">{name}</h3>
          <p className="font-ui text-sm font-semibold text-gray-600">
            {total} medal{total !== 1 ? 's' : ''} total
          </p>
        </div>

        {/* Medal Counts */}
        <div className="flex gap-6">
          <div className="text-center">
            <div className="w-14 h-14 bg-black flex items-center justify-center mb-2">
              <Trophy className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-black">{gold}</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-gray-400 flex items-center justify-center mb-2">
              <Medal className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-gray-600">{silver}</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-gray-600 flex items-center justify-center mb-2">
              <Award className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <div className="font-heading text-2xl font-black text-gray-600">{bronze}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
