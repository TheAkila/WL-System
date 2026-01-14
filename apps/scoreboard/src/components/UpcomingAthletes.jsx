export default function UpcomingAthletes({ athletes }) {
  if (!athletes || athletes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-bold text-gray-800">Next Up</h3>
      </div>
      <div className="divide-y">
        {athletes.map((athlete, index) => (
          <div key={athlete.athlete_id} className="p-4 flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 truncate">
                {athlete.athlete_name}
              </div>
              <div className="text-sm text-gray-600">
                {athlete.country} • #{athlete.start_number}
              </div>
            </div>
            <div className="text-right">
              {athlete.requested_weight > 0 ? (
                <>
                  <div className="font-bold text-lg text-gray-900">
                    {athlete.requested_weight} kg
                  </div>
                  <div className="text-xs text-gray-500">
                    Attempt {athlete.attempt_number}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Pending</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
