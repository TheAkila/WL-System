import { useState } from 'react';
import { Bell, Send, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AnnouncementPanel({ sessionId }) {
  const [message, setMessage] = useState('');
  const [announcementType, setAnnouncementType] = useState('info');
  const [sending, setSending] = useState(false);

  const quickAnnouncements = [
    { text: '2-minute warning', type: 'warning' },
    { text: 'Next athlete to warm-up area', type: 'info' },
    { text: 'Technical delay - please stand by', type: 'warning' },
    { text: 'Break time - 10 minutes', type: 'info' },
    { text: 'Competition resuming', type: 'success' },
    { text: 'Please check attempt board for updates', type: 'info' },
  ];

  const handleSendAnnouncement = async (customMessage = null) => {
    const msgToSend = customMessage || message;
    
    if (!msgToSend.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setSending(true);
      await api.post(`/notifications/${sessionId}/announcement`, {
        message: msgToSend,
        type: announcementType,
      });
      
      toast.success('📢 Announcement sent');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send announcement');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-600" />;
      case 'error':
        return <X size={18} className="text-red-600" />;
      case 'success':
        return <CheckCircle size={18} className="text-green-600" />;
      default:
        return <Info size={18} className="text-blue-600" />;
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'success':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="text-blue-600" size={24} />
        <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
          Announcements
        </h3>
      </div>

      {/* Custom Message */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
            Announcement Type
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['info', 'success', 'warning', 'error'].map((type) => (
              <button
                key={type}
                onClick={() => setAnnouncementType(type)}
                className={`py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  announcementType === type
                    ? getTypeBadgeClass(type)
                    : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
                }`}
              >
                {getTypeIcon(type)}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter announcement message..."
            rows={3}
            className="input resize-none"
          />
        </div>

        <button
          onClick={() => handleSendAnnouncement()}
          disabled={!message.trim() || sending || !sessionId}
          className="w-full btn btn-primary flex items-center justify-center gap-2"
        >
          <Send size={20} />
          <span>{sending ? 'Sending...' : 'Send Announcement'}</span>
        </button>
      </div>

      {/* Quick Announcements */}
      <div className="pt-6 border-t border-slate-200 dark:border-zinc-700">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3">
          Quick Announcements
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {quickAnnouncements.map((announcement, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAnnouncementType(announcement.type);
                handleSendAnnouncement(announcement.text);
              }}
              disabled={sending || !sessionId}
              className="p-3 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getTypeIcon(announcement.type)}
              <span className="text-sm text-slate-700 dark:text-zinc-300">
                {announcement.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          <strong>Note:</strong> Announcements are broadcast to all connected display screens and scoreboards for the selected session.
        </p>
      </div>
    </div>
  );
}
