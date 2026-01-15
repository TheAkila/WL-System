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
              {/* Main content */}
              <div className="relative bg-white border-8 border-black px-32 py-20 shadow-2xl">
                <div className="flex items-center gap-12">
                  {/* Check Icon */}
                  <div className="font-heading text-[15rem] leading-none font-black text-black animate-bounce">
                    ✓
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <div className="font-heading text-[10rem] font-black text-black leading-none mb-4">
                      GOOD
                    </div>
                    <div className="font-heading text-[10rem] font-black text-black leading-none">
                      LIFT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Athlete Name */}
            <div className="mt-12 font-heading text-6xl font-black text-white animate-pulse">
              {attempt.athlete?.name}
            </div>
            
            {/* Weight */}
            <div className="mt-6 font-heading text-8xl font-black text-white">
              {attempt.weight} kg
            </div>
          </div>
        ) : (
          // NO LIFT Animation
          <div className="text-center">
            <div className="relative">
              {/* Main content */}
              <div className="relative bg-white border-8 border-black px-32 py-20 shadow-2xl">
                <div className="flex items-center gap-12">
                  {/* X Icon */}
                  <div className="font-heading text-[15rem] leading-none font-black text-black animate-shake">
                    ✗
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <div className="font-heading text-[10rem] font-black text-black leading-none mb-4">
                      NO
                    </div>
                    <div className="font-heading text-[10rem] font-black text-black leading-none">
                      LIFT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Athlete Name */}
            <div className="mt-12 font-heading text-6xl font-black text-white">
              {attempt.athlete?.name}
            </div>
            
            {/* Weight */}
            <div className="mt-6 font-heading text-8xl font-black text-white">
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
