import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Users, Trophy, Calendar, ArrowRight, Zap, Download } from 'lucide-react';

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
      <div className="mb-6">
        <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-600 dark:text-zinc-400 font-ui">Welcome back to the competition management system</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/competitions" className="cursor-pointer">
          <div className="card border-2 border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl group-hover:scale-110 transition-transform">
                <Trophy size={32} />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-2">Current Competition</p>
              {stats.competition ? (
                <>
                  <p className="text-lg font-heading font-bold text-slate-900 dark:text-white line-clamp-2">{stats.competition.name}</p>
                </>
              ) : (
                <p className="text-4xl font-heading font-bold text-slate-900 dark:text-white">-</p>
              )}
            </div>
          </div>
        </Link>
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
      <div className="grid grid-cols-1 gap-4">
        {/* Quick Actions */}
        <div>
          <div className="card card-lg border-2 border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link to="/competitions" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Trophy size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">New Competition</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Create event</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/athletes" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Users size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Register Athlete</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Add participant</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/sessions" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Calendar size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Create Session</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Schedule event</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/technical" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Zap size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Technical Panel</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Live control</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/teams" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Users size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Manage Teams</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Clubs & countries</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/weigh-in" className="border-2 border-slate-200 dark:border-slate-700 h-16 justify-start pl-6 group hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 rounded-xl px-6">
                <Download size={24} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 dark:text-white">Weigh-In</div>
                  <div className="text-xs opacity-80 text-slate-600 dark:text-slate-400">Record body weight</div>
                </div>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link, highlight, color }) {
  const colorClasses = {
    'brand-red': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    'blue': 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    'purple': 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    'green': 'bg-green-50 dark:bg-green-900/20 text-green-600',
  };

  const content = (
    <div className={`card border-2 border-slate-200 dark:border-slate-700 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 group ${highlight ? 'ring-2 ring-slate-900 dark:ring-white' : ''}`}>
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
