export default function CurrentLiftDisplay({ session }) {
  if (!session) return null;

  const liftName = session.current_lift === 'snatch' ? 'SNATCH' : 'CLEAN & JERK';

  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-6">
      <div className="text-center">
        <div className="text-sm opacity-80 mb-2">CURRENT LIFT</div>
        <div className="text-4xl font-bold">{liftName}</div>
      </div>
    </div>
  );
}
