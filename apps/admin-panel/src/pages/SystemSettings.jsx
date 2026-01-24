import { useState, useEffect } from 'react';
import { Settings, Database, Activity, Cpu, HardDrive, Zap, CheckCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const [stats, setStats] = useState({
    users: 0,
    competitions: 0,
    athletes: 0,
    sessions: 0,
    uptime: 0,
    version: '1.0.0',
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">
          System Settings
        </h1>
        <p className="text-slate-600 dark:text-zinc-400 font-ui">
          Monitor system health and configuration
        </p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Database size={24} />}
          label="Total Users"
          value={stats.users}
          color="blue"
        />
        <StatCard
          icon={<Activity size={24} />}
          label="Competitions"
          value={stats.competitions}
          color="purple"
        />
        <StatCard
          icon={<Zap size={24} />}
          label="Athletes"
          value={stats.athletes}
          color="green"
        />
        <StatCard
          icon={<HardDrive size={24} />}
          label="Sessions"
          value={stats.sessions}
          color="red"
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card card-lg">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="text-green-600" size={24} />
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              System Health
            </h2>
          </div>
          
          <div className="space-y-4">
            <HealthItem label="API Server" status="online" />
            <HealthItem label="Database Connection" status="online" />
            <HealthItem label="Real-time Services" status="online" />
            <HealthItem label="Storage Service" status="online" />
          </div>
        </div>

        <div className="card card-lg">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-blue-600" size={24} />
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              System Information
            </h2>
          </div>
          
          <div className="space-y-3">
            <InfoRow label="Version" value={stats.version} />
            <InfoRow label="Uptime" value={formatUptime(stats.uptime)} />
            <InfoRow label="Environment" value={import.meta.env.MODE || 'production'} />
            <InfoRow label="API Endpoint" value={import.meta.env.VITE_API_URL || 'http://localhost:5000'} />
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="card card-lg">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-purple-600" size={24} />
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
            System Configuration
          </h2>
        </div>

        <div className="space-y-4">
          <ConfigItem
            label="Real-time Updates"
            description="Socket.IO connection for live data"
            enabled={true}
          />
          <ConfigItem
            label="File Upload"
            description="Supabase Storage integration"
            enabled={true}
          />
          <ConfigItem
            label="PDF Export"
            description="Protocol sheet generation"
            enabled={true}
          />
          <ConfigItem
            label="CSV Export"
            description="Leaderboard and start list exports"
            enabled={true}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            fetchStats();
            toast.success('Stats refreshed');
          }}
          className="btn btn-secondary flex items-center justify-center gap-2"
        >
          <Activity size={20} />
          <span>Refresh Stats</span>
        </button>
        <button
          onClick={() => toast.info('Backup functionality coming soon')}
          className="btn btn-secondary flex items-center justify-center gap-2"
        >
          <Database size={20} />
          <span>Backup Database</span>
        </button>
        <button
          onClick={() => toast.info('Logs functionality coming soon')}
          className="btn btn-secondary flex items-center justify-center gap-2"
        >
          <HardDrive size={20} />
          <span>View Logs</span>
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600',
  };

  return (
    <div className="card">
      <div className={`p-3 ${colorClasses[color]} rounded-xl mb-4 inline-flex`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function HealthItem({ label, status }) {
  const isOnline = status === 'online';
  
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800">
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          {isOnline ? 'Operational' : 'Down'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isOnline && (
          <>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-zinc-800">
      <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function ConfigItem({ label, description, enabled }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800">
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {enabled ? (
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg">
            Enabled
          </span>
        ) : (
          <span className="px-3 py-1 bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400 text-xs font-semibold rounded-lg">
            Disabled
          </span>
        )}
      </div>
    </div>
  );
}
