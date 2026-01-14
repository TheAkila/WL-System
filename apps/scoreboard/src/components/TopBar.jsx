export default function TopBar() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white sticky top-0 z-10 shadow-lg">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">🏋️ Lifting Live</h1>
            <p className="text-xs text-blue-100 mt-0.5">Spectator View</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
