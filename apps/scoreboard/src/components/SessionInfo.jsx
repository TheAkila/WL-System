export default function SessionInfo({ session }) {
  if (!session) {
    return (
      <div className="card text-center">
        <p className="text-gray-500">No active session</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{session.name}</h2>
          <p className="text-gray-600">
            {session.gender === 'male' ? '🚹' : '🚺'} {session.weightCategory}
          </p>
        </div>
        <div>
          <span
            className={`badge ${
              session.status === 'in-progress'
                ? 'badge-success'
                : session.status === 'completed'
                ? 'badge-warning'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {session.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
