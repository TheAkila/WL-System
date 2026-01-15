export default function ScrollingBanner() {
  const text = "Senior National Weightlifting Championship 2025";

  return (
    <div className="bg-black border-b-2 border-black py-3 overflow-hidden">
      <div className="flex animate-scroll whitespace-nowrap">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="font-heading text-lg font-black text-white uppercase tracking-widest">
            {text} • &nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
