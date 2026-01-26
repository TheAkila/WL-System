export default function SessionSelector({ sessions, onSelectSession, loading }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-zinc-500 text-4xl mb-4">⏳</div>
        <p className="text-slate-600 dark:text-zinc-400">Loading sessions...</p>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 dark:text-zinc-500 text-4xl mb-4">📋</div>
        <p className="text-slate-600 dark:text-zinc-400 mb-4">No sessions available</p>
        <p className="text-sm text-slate-500 dark:text-zinc-500">Create a session from the Sessions page</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Select Session</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session)}
            className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{session.name}</h3>
              <span
                className={`badge ${
                  session.status === 'in-progress'
                    ? 'badge-success'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {session.status}
              </span>
            </div>
            {session.competition && (
              <p className="text-gray-500 text-xs mt-2">{session.competition.name}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
