export default function CompetitionHeader({ session }) {
  if (!session) return null;

  const competition = session.competition;

  return (
    <div className="bg-white text-black border-b-4 border-black p-8 shadow-brand">
      <div className="flex items-center justify-between">
        {/* Competition Name */}
        <div className="flex-1">
          <h1 className="font-heading text-6xl font-black text-black mb-4 tracking-tight">
            {competition?.name || 'Weightlifting Competition'}
          </h1>
          <div className="flex items-center gap-4 text-2xl text-black font-heading font-bold tracking-wide">
            <span>{session.name}</span>
            <span className="text-gray-400">•</span>
            <span>
              {session.gender === 'male' ? 'Men' : 'Women'} {session.weight_category}kg
            </span>
            <span className="text-gray-400">•</span>
            <span className="uppercase">
              {session.current_lift === 'snatch' ? 'SNATCH' : 'CLEAN & JERK'}
            </span>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-black text-white border-4 border-black p-6 ml-8">
          <div className="text-center">
            <div className="font-heading text-3xl font-black mb-2">LIFTING LIVE</div>
            <div className="font-ui text-xs font-bold tracking-widest uppercase">Live Display</div>
          </div>
        </div>
      </div>
    </div>
  );
}
