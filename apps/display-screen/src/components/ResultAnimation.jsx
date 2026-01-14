import { useEffect, useState } from 'react';

export default function ResultAnimation({ attempt }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, [attempt]);

  if (!show) return null;

  const isGoodLift = attempt.result === 'good';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm animate-fadeIn">
      <div className={`transform animate-scaleIn ${isGoodLift ? 'animate-bounce' : 'animate-shake'}`}>
        {isGoodLift ? (
          // GOOD LIFT Animation
          <div className="text-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-green-500 blur-[100px] opacity-50 animate-pulse"></div>
              
              {/* Main content */}
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-[4rem] px-32 py-20 shadow-2xl border-8 border-green-300">
                <div className="flex items-center gap-12">
                  {/* Check Icon */}
                  <div className="text-[15rem] leading-none animate-bounce">
                    ✓
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <div className="text-[10rem] font-black text-white leading-none mb-4">
                      GOOD
                    </div>
                    <div className="text-[10rem] font-black text-green-900 leading-none">
                      LIFT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Athlete Name */}
            <div className="mt-12 text-6xl font-bold text-white animate-pulse">
              {attempt.athlete?.name}
            </div>
            
            {/* Weight */}
            <div className="mt-6 text-8xl font-black text-green-400">
              {attempt.weight} kg
            </div>
          </div>
        ) : (
          // NO LIFT Animation
          <div className="text-center">
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-red-500 blur-[100px] opacity-50 animate-pulse"></div>
              
              {/* Main content */}
              <div className="relative bg-gradient-to-br from-red-500 to-red-700 rounded-[4rem] px-32 py-20 shadow-2xl border-8 border-red-400">
                <div className="flex items-center gap-12">
                  {/* X Icon */}
                  <div className="text-[15rem] leading-none animate-shake">
                    ✗
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <div className="text-[10rem] font-black text-white leading-none mb-4">
                      NO
                    </div>
                    <div className="text-[10rem] font-black text-red-900 leading-none">
                      LIFT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Athlete Name */}
            <div className="mt-12 text-6xl font-bold text-white">
              {attempt.athlete?.name}
            </div>
            
            {/* Weight */}
            <div className="mt-6 text-8xl font-black text-red-400">
              {attempt.weight} kg
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            transform: scale(0.5);
            opacity: 0;
          }
          to { 
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
