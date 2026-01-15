import { Clock } from 'lucide-react';

export default function UpcomingAthletes({ athletes }) {
  if (!athletes || athletes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-2 border-black overflow-hidden">
      <div className="px-6 py-4 border-b-2 border-black bg-black">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
          <h3 className="font-heading text-xl font-black text-white tracking-tight">NEXT UP</h3>
        </div>
      </div>
      <div className="divide-y-2 divide-black">
        {athletes.map((athlete, index) => (
          <div key={athlete.athlete_id} className="p-5 flex items-center gap-4 hover:bg-gray-100 transition-colors">
            <div className="w-12 h-12 bg-black flex items-center justify-center flex-shrink-0">
              <span className="font-heading text-xl font-black text-white">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-heading text-lg sm:text-xl font-black text-black truncate">
                {athlete.athlete_name}
              </div>
              <div className="font-ui text-sm text-black flex items-center gap-2">
                <span>{athlete.country}</span>
                <span className="text-gray-400">•</span>
                <span>#{athlete.start_number}</span>
              </div>
            </div>
            <div className="text-right">
              {athlete.requested_weight > 0 ? (
                <>
                  <div className="font-heading text-2xl sm:text-3xl font-black text-black">
                    {athlete.requested_weight}
                  </div>
                  <div className="font-ui text-xs text-gray-600 uppercase tracking-widest font-bold">
                    Attempt {athlete.attempt_number}
                  </div>
                </>
              ) : (
                <div className="font-ui text-sm text-gray-600 italic">Pending</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
