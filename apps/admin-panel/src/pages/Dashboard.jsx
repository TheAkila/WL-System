import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Users, Trophy, Calendar, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    competitions: 0,
    athletes: 0,
    sessions: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [comps, athletes, sessions] = await Promise.all([
        api.get('/competitions'),
        api.get('/athletes'),
        api.get('/sessions'),
      ]);

      setStats({
        competitions: comps.data.count,
        athletes: athletes.data.count,
        sessions: sessions.data.count,
        activeSessions: sessions.data.data.filter((s) => s.status === 'in-progress').length,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="font-heading text-5xl font-black text-black mb-2">DASHBOARD</h1>
        <p className="font-ui text-sm font-bold text-black tracking-widest uppercase">Welcome back to the admin panel</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          icon={<Trophy size={32} />}
          label="Competitions"
          value={stats.competitions}
          link="/competitions"
        />
        <StatCard
          icon={<Users size={32} />}
          label="Athletes"
          value={stats.athletes}
          link="/athletes"
        />
        <StatCard
          icon={<Calendar size={32} />}
          label="Sessions"
          value={stats.sessions}
          link="/sessions"
        />
        <StatCard
          icon={<Activity size={32} />}
          label="Active Sessions"
          value={stats.activeSessions}
          highlight
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="font-heading text-2xl font-black text-black mb-6 uppercase tracking-widest">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/competitions" className="btn btn-primary group">
              <Trophy size={20} />
              <span>Create Competition</span>
              <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/athletes" className="btn btn-secondary group">
              <Users size={20} />
              <span>Register Athlete</span>
              <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/sessions" className="btn btn-secondary group">
              <Calendar size={20} />
              <span>Create Session</span>
              <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/technical" className="btn btn-secondary group">
              <Activity size={20} />
              <span>Go to Technical Panel</span>
              <ArrowRight size={16} className="ml-auto group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h2 className="font-heading text-2xl font-black text-black mb-6 uppercase tracking-widest">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
              <div>
                <p className="font-heading font-bold text-black">API Server</p>
                <p className="font-ui text-sm text-gray-700">Backend connectivity</p>
              </div>
              <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
              <div>
                <p className="font-heading font-bold text-black">Database</p>
                <p className="font-ui text-sm text-gray-700">Data persistence</p>
              </div>
              <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black">
              <div>
                <p className="font-heading font-bold text-black">Real-time Updates</p>
                <p className="font-ui text-sm text-gray-700">WebSocket connectivity</p>
              </div>
              <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link, highlight }) {
  const content = (
    <div className={`card cursor-pointer transition-all hover:shadow-brand-lg group ${highlight ? 'border-4 border-black' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-black text-white rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <p className="font-ui text-sm font-bold text-gray-600 uppercase tracking-widest mb-2">{label}</p>
        <p className="font-heading text-5xl font-black text-black">{value}</p>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}
