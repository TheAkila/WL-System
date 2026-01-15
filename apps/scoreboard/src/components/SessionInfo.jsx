export default function SessionInfo({ session }) {
  if (!session) {
    return (
      <div className="bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-800 p-6 text-center">
        <p className="text-slate-500 font-ui">No active session</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border-2 border-slate-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-black text-white">{session.name}</h2>
          <p className="font-ui text-slate-400 mt-1">
            {session.gender === 'male' ? '🚹' : '🚺'} {session.weightCategory}
          </p>
        </div>
        <div>
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-ui font-bold shadow-lg ${
              session.status === 'in-progress'
                ? 'bg-green-500 text-white'
                : session.status === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700 text-white'
            }`}
          >
            {session.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
