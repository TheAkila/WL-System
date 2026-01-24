import { useState } from 'react';
import { Users, Phone, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AthleteCallUp({ sessionId, liftingOrder }) {
  const [calling, setCalling] = useState(false);

  const currentAthlete = liftingOrder[0];
  const onDeckAthlete = liftingOrder[1];
  const inHoleAthlete = liftingOrder[2];

  const callAthlete = async (athleteId, position, athleteName) => {
    if (!athleteId) return;

    try {
      setCalling(true);
      await api.post(`/notifications/${sessionId}/call-athlete/${athleteId}`, {
        position,
      });
      
      const positionText = position === 'current' ? 'to platform' : 
                          position === 'on-deck' ? 'on deck' : 'in the hole';
      toast.success(`🔔 Called ${athleteName} ${positionText}`);
    } catch (error) {
      toast.error('Failed to call athlete');
      console.error(error);
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Phone className="text-green-600" size={24} />
        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
          Athlete Call-Ups
        </h3>
      </div>

      <div className="space-y-3">
        {/* Current Athlete */}
        {currentAthlete && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                  CURRENT LIFTER
                </div>
                <div className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  #{currentAthlete.start_number} {currentAthlete.athlete_name}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  {currentAthlete.weight}kg • {currentAthlete.lift_type === 'snatch' ? 'Snatch' : 'C&J'}
                </div>
              </div>
              <button
                onClick={() => callAthlete(currentAthlete.athlete_id, 'current', currentAthlete.athlete_name)}
                disabled={calling || !sessionId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Phone size={18} />
                <span>Call</span>
              </button>
            </div>
          </div>
        )}

        {/* On Deck */}
        {onDeckAthlete && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mb-1">
                  ON DECK
                </div>
                <div className="font-heading font-bold text-slate-900 dark:text-white">
                  #{onDeckAthlete.start_number} {onDeckAthlete.athlete_name}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  {onDeckAthlete.weight}kg • {onDeckAthlete.lift_type === 'snatch' ? 'Snatch' : 'C&J'}
                </div>
              </div>
              <button
                onClick={() => callAthlete(onDeckAthlete.athlete_id, 'on-deck', onDeckAthlete.athlete_name)}
                disabled={calling || !sessionId}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Phone size={18} />
                <span>Call</span>
              </button>
            </div>
          </div>
        )}

        {/* In the Hole */}
        {inHoleAthlete && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                  IN THE HOLE
                </div>
                <div className="font-heading font-bold text-slate-900 dark:text-white">
                  #{inHoleAthlete.start_number} {inHoleAthlete.athlete_name}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  {inHoleAthlete.weight}kg • {inHoleAthlete.lift_type === 'snatch' ? 'Snatch' : 'C&J'}
                </div>
              </div>
              <button
                onClick={() => callAthlete(inHoleAthlete.athlete_id, 'in-hole', inHoleAthlete.athlete_name)}
                disabled={calling || !sessionId}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Phone size={18} />
                <span>Call</span>
              </button>
            </div>
          </div>
        )}

        {liftingOrder.length === 0 && (
          <div className="p-8 text-center text-slate-500 dark:text-zinc-400">
            <Users className="mx-auto mb-3 opacity-30" size={48} />
            <p>No athletes in lifting order</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg flex items-start gap-2">
        <AlertCircle size={16} className="text-slate-500 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600 dark:text-zinc-400">
          Call-ups notify athletes on displays and scoreboards. Call &ldquo;On Deck&rdquo; when previous athlete is on platform, and &ldquo;In the Hole&rdquo; when on-deck athlete is called.
        </p>
      </div>
    </div>
  );
}
