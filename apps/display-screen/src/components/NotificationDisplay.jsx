import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationDisplay({ socket }) {
  const [announcement, setAnnouncement] = useState(null);
  const [athleteCall, setAthleteCall] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for announcements
    socket.on('announcement', (data) => {
      setAnnouncement(data);
      // Auto-hide after 10 seconds
      setTimeout(() => setAnnouncement(null), 10000);
    });

    // Listen for athlete calls
    socket.on('athlete:called', (data) => {
      setAthleteCall(data);
      // Auto-hide after 15 seconds
      setTimeout(() => setAthleteCall(null), 15000);
    });

    // Listen for general notifications
    socket.on('notification', (data) => {
      setNotification(data);
      // Auto-hide based on priority
      const duration = data.priority === 'urgent' ? 20000 : data.priority === 'high' ? 15000 : 10000;
      setTimeout(() => setNotification(null), duration);
    });

    return () => {
      socket.off('announcement');
      socket.off('athlete:called');
      socket.off('notification');
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
                  <div className="text-lg font-bold">{announcement.message}</div>
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
                  <div className="text-2xl font-bold">Athlete #{athleteCall.athleteId}</div>
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

      {/* General Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white dark:bg-zinc-800 shadow-2xl rounded-xl border-2 border-slate-200 dark:border-zinc-700 animate-slide-up">
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  {notification.title}
                </div>
                <div className="text-sm text-slate-600 dark:text-zinc-400">
                  {notification.message}
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            {notification.priority === 'urgent' && (
              <div className="mt-2 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded inline-block">
                URGENT
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
