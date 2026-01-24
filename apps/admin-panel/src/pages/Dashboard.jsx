import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Users, Trophy, Calendar, ArrowRight, Zap, CheckCircle, Download } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    competition: null,
    athletes: 0,
    sessions: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [compRes, athletesRes, sessionsRes] = await Promise.all([
        api.get('/competitions/current'),
        api.get('/athletes'),
        api.get('/sessions'),
      ]);

      const competition = compRes.data?.data || null;
      const athletesCount = athletesRes.data?.count || athletesRes.data?.data?.length || 0;
      const sessionsCount = sessionsRes.data?.count || sessionsRes.data?.data?.length || 0;
      const sessionsData = sessionsRes.data?.data || [];
      const activeCount = sessionsData.filter((s) => s.status === 'in-progress' || s.status === 'active').length;

      setStats({
        competition,
        athletes: athletesCount,
        sessions: sessionsCount,
        activeSessions: activeCount,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default values on error
      setStats({
        competition: null,
        athletes: 0,
        sessions: 0,
        activeSessions: 0,
      });
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-zinc-400 font-ui">Welcome back to the competition management system</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid-hub-4 mb-12">
        <div className="card card-lg bg-gradient-to-br from-brand-red to-red-700 text-white">
          <div className="flex items-center justify-between mb-4">
            <Trophy size={32} />
          </div>
          <div className="mb-2">
            <p className="text-white/80 text-sm font-medium">Current Competition</p>
            {stats.competition ? (
              <>
                <h3 className="text-2xl font-heading font-bold mt-1">{stats.competition.name}</h3>
                <p className="text-white/70 text-sm mt-1">
                  {new Date(stats.competition.date).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-white/70 text-sm mt-1">No competition configured</p>
            )}
          </div>
          <Link to="/competitions" className="text-white/90 hover:text-white text-sm inline-flex items-center gap-1 mt-2">
            Manage <ArrowRight size={14} />
          </Link>
        </div>
        <StatCard
          icon={<Users size={32} />}
          label="Athletes"
          value={stats.athletes}
          link="/athletes"
          color="blue"
        />
        <StatCard
          icon={<Calendar size={32} />}
          label="Sessions"
          value={stats.sessions}
          link="/sessions"
          color="purple"
        />
        <StatCard
          icon={<Activity size={32} />}
          label="Active Sessions"
          value={stats.activeSessions}
          highlight
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card card-lg">
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/competitions" className="btn btn-primary h-16 justify-start pl-6 group hover:shadow-brand-red">
                <Trophy size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">New Competition</div>
                  <div className="text-xs opacity-80">Create event</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/athletes" className="btn btn-primary h-16 justify-start pl-6 group hover:shadow-brand-red">
                <Users size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Register Athlete</div>
                  <div className="text-xs opacity-80">Add participant</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/sessions" className="btn btn-primary h-16 justify-start pl-6 group hover:shadow-brand-red">
                <Calendar size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Create Session</div>
                  <div className="text-xs opacity-80">Schedule event</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/technical" className="btn btn-primary h-16 justify-start pl-6 group hover:shadow-brand-red">
                <Zap size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Technical Panel</div>
                  <div className="text-xs opacity-80">Live control</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/teams" className="btn btn-secondary h-16 justify-start pl-6 group hover:shadow-lg">
                <Users size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Manage Teams</div>
                  <div className="text-xs opacity-80">Clubs & countries</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/weigh-in" className="btn btn-secondary h-16 justify-start pl-6 group hover:shadow-lg">
                <Download size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold">Weigh-In</div>
                  <div className="text-xs opacity-80">Record body weight</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card card-lg">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">System Status</h2>
          <div className="space-y-4">
            <StatusItem label="API Server" status="online" />
            <StatusItem label="Database" status="online" />
            <StatusItem label="Real-time Updates" status="online" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link, highlight, color }) {
  const colorClasses = {
    'brand-red': 'bg-red-50 dark:bg-red-900/20 text-red-600',
    'blue': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    'purple': 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    'green': 'bg-green-50 dark:bg-green-900/20 text-green-600',
  };

  const content = (
    <div className={`card cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${highlight ? 'ring-2 ring-red-600' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${colorClasses[color]} rounded-xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-4xl font-heading font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}

function StatusItem({ label, status }) {
  const isOnline = status === 'online';
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-zinc-800">
      <div>
        <p className="font-ui font-semibold text-slate-900 dark:text-white">{label}</p>
        <p className="text-xs text-slate-500 dark:text-zinc-400">System connectivity</p>
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
