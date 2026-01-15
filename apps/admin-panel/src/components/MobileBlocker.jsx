import { useEffect, useState } from 'react';
import { Monitor } from 'lucide-react';

export default function MobileBlocker({ children }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if screen is smaller than desktop size (1024px)
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024;
      setIsMobile(isMobileView);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-8 flex justify-center">
            <Monitor size={80} className="text-white" strokeWidth={1} />
          </div>
          <h1 className="font-heading text-3xl font-black text-white mb-4">
            DESKTOP ONLY
          </h1>
          <p className="font-ui text-lg text-white mb-6">
            The admin panel is optimized for desktop computers only.
          </p>
          <p className="font-ui text-sm text-gray-400">
            Please access this application from a desktop or laptop with a screen width of 1024px or larger.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
