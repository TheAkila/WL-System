import ScrollingBanner from './ScrollingBanner';

export default function TopBar() {
  return (
    <>
      {/* Scrolling Banner */}
      <ScrollingBanner />
      
      {/* Main Header */}
      <div className="bg-white text-black sticky top-0 z-10 border-b border-black">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-black tracking-tight">National Championship 2025</h1>
              <p className="font-ui text-xs text-black mt-1 font-medium tracking-wider uppercase">Lifting Social</p>
            </div>
            <div className="flex items-center gap-2 bg-black px-4 py-2 rounded-none">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-ui text-xs font-bold text-white tracking-widest">LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
