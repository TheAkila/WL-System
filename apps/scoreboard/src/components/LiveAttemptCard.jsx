import { User, Weight, Check, X } from 'lucide-react';

export default function LiveAttemptCard({ attempt }) {
  if (!attempt || !attempt.athlete_name) {
    return (
      <div className="bg-white border-2 border-black p-12 text-center">
        <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
          <Weight className="w-10 h-10 text-white" />
        </div>
        <h3 className="font-heading text-3xl font-black text-black mb-3">
          Waiting for Next Lift
        </h3>
        <p className="font-body text-black">
          The competition will resume shortly
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black overflow-hidden">
      {/* Header */}
      <div className="bg-black px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white flex items-center justify-center">
            <User className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-ui text-xs text-white uppercase tracking-widest font-bold">Now Lifting</div>
            <div className="font-heading text-2xl font-black text-white tracking-tight">{attempt.athlete_name}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-ui text-xs text-white uppercase tracking-widest font-bold">Attempt</div>
          <div className="font-heading text-2xl font-black text-white">{attempt.attempt_number}/3</div>
        </div>
      </div>

      {/* Weight Display */}
      <div className="p-10 text-center bg-gray-100">
        <div className="font-heading text-8xl sm:text-9xl font-black text-black mb-2 tracking-tighter">
          {attempt.requested_weight}
        </div>
        <div className="font-ui text-2xl font-bold text-gray-600 uppercase tracking-widest">
          KILOGRAMS
        </div>
      </div>

      {/* Details */}
      <div className="border-t-2 border-black px-6 py-5 grid grid-cols-3 divide-x-2 divide-black bg-white">
        <div className="text-center px-4">
          <div className="font-ui text-xs text-black uppercase tracking-widest mb-2 font-bold">Country</div>
          <div className="font-heading text-xl font-black text-black">{attempt.country}</div>
        </div>
        <div className="text-center px-4">
          <div className="font-ui text-xs text-black uppercase tracking-widest mb-2 font-bold">Body Weight</div>
          <div className="font-heading text-xl font-black text-black">{attempt.body_weight}kg</div>
        </div>
        <div className="text-center px-4">
          <div className="font-ui text-xs text-black uppercase tracking-widest mb-2 font-bold">Lift Type</div>
          <div className="font-heading text-xl font-black text-black">{attempt.lift_type === 'snatch' ? 'Snatch' : 'C&J'}</div>
        </div>
      </div>
    </div>
  );
}
