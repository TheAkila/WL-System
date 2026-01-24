import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

export default function NotificationDisplay({ socket }) {
  const [announcement, setAnnouncement] = useState(null);
  const [athleteCall, setAthleteCall] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for announcements
    socket.on('announcement', (data) => {
      setAnnouncement(data);
      setTimeout(() => setAnnouncement(null), 10000);
    });

    // Listen for athlete calls
    socket.on('athlete:called', (data) => {
      setAthleteCall(data);
      setTimeout(() => setAthleteCall(null), 15000);
    });

    return () => {
      socket.off('announcement');
      socket.off('athlete:called');
    };
  }, [socket]);

  const getAnnouncementClass = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getCallPositionClass = (position) => {
    switch (position) {
      case 'current':
        return 'bg-red-600 text-white';
      case 'on-deck':
        return 'bg-yellow-600 text-white';
      case 'in-hole':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  return (
    <>
      {/* Announcement Banner */}
      {announcement && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${getAnnouncementClass(announcement.type)} shadow-2xl`}>
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={24} className="animate-pulse" />
                <div>
                  <div className="text-sm font-semibold opacity-90">ANNOUNCEMENT</div>
                  <div className="text-xl font-bold">{announcement.message}</div>
                </div>
              </div>
              <button
                onClick={() => setAnnouncement(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Athlete Call Notification */}
      {athleteCall && (
        <div className={`fixed top-20 left-0 right-0 z-50 ${getCallPositionClass(athleteCall.position)} shadow-2xl`}>
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell size={32} className="animate-bounce" />
                <div>
                  <div className="text-sm font-semibold opacity-90 uppercase">
                    {athleteCall.position === 'current' && 'ATHLETE TO PLATFORM'}
                    {athleteCall.position === 'on-deck' && 'ON DECK'}
                    {athleteCall.position === 'in-hole' && 'IN THE HOLE'}
                  </div>
                  <div className="text-3xl font-bold">Athlete #{athleteCall.athleteId}</div>
                </div>
              </div>
              <button
                onClick={() => setAthleteCall(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
