export default function Header() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          🏋️ LIFTING LIVE ARENA
        </h1>
        <p className="text-center text-blue-100 mt-1 text-sm md:text-base">
          Live Competition Scoreboard
        </p>
      </div>
    </header>
  );
}
