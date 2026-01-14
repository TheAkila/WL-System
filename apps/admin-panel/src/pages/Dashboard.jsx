import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Activity, Users, Trophy, Calendar } from 'lucide-react';

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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Trophy className="text-yellow-500" size={32} />}
          label="Competitions"
          value={stats.competitions}
          link="/competitions"
        />
        <StatCard
          icon={<Users className="text-blue-500" size={32} />}
          label="Athletes"
          value={stats.athletes}
          link="/athletes"
        />
        <StatCard
          icon={<Calendar className="text-green-500" size={32} />}
          label="Sessions"
          value={stats.sessions}
          link="/sessions"
        />
        <StatCard
          icon={<Activity className="text-red-500" size={32} />}
          label="Active Sessions"
          value={stats.activeSessions}
          highlight
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link to="/competitions" className="block btn btn-primary">
              Create New Competition
            </Link>
            <Link to="/athletes" className="block btn btn-secondary">
              Register Athlete
            </Link>
            <Link to="/sessions" className="block btn btn-secondary">
              Create Session
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">No recent activity</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, link, highlight }) {
  const content = (
    <div className={`card ${highlight ? 'border-2 border-red-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div>{icon}</div>
      </div>
    </div>
  );

  return link ? <Link to={link}>{content}</Link> : content;
}
