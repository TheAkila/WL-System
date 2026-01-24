import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Users, Settings, BarChart3, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const CompetitionDashboard = () => {
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [stats, setStats] = useState({
    totalAthletes: 0,
    registeredAthletes: 0,
    completedSessions: 0,
    totalSessions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitionData();
  }, []);

  const fetchCompetitionData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch active competition
      const compRes = await fetch('http://localhost:5000/api/competitions?status=active', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const compData = await compRes.json();
      
      if (compData.data && compData.data.length > 0) {
        setCompetition(compData.data[0]);
        
        // Fetch stats
        const statsRes = await fetch(
          `http://localhost:5000/api/competitions/${compData.data[0].id}/stats`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const statsData = await statsRes.json();
        setStats(statsData.data || {});
      }
    } catch (error) {
      console.error('Error fetching competition:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    {
      number: 1,
      title: 'Create Competition',
      description: 'Setup competition details',
      status: competition ? 'completed' : 'current',
      action: 'Competition Setup',
      icon: Settings,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      number: 2,
      title: 'Register Athletes',
      description: `${stats.registeredAthletes} / ${stats.totalAthletes} athletes`,
      status: stats.registeredAthletes > 0 ? 'in-progress' : 'pending',
      action: 'Register Athletes',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      number: 3,
      title: 'Create Sessions',
      description: `${stats.completedSessions} / ${stats.totalSessions} sessions`,
      status: stats.totalSessions > 0 ? 'in-progress' : 'pending',
      action: 'Manage Sessions',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      number: 4,
      title: 'Run Live Competition',
      description: 'Record attempt results',
      status: stats.completedSessions > 0 ? 'in-progress' : 'pending',
      action: 'Technical Control',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-600',
    },
    {
      number: 5,
      title: 'Calculate Results',
      description: 'Auto-generate rankings',
      status: stats.completedSessions === stats.totalSessions ? 'in-progress' : 'pending',
      action: 'View Results',
      icon: BarChart3,
      color: 'bg-green-100 text-green-600',
    },
    {
      number: 6,
      title: 'Generate Reports',
      description: 'Export certificates & medals',
      status: 'pending',
      action: 'Download Reports',
      icon: Download,
      color: 'bg-indigo-100 text-indigo-600',
    },
  ];

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      current: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {competition ? competition.name : 'Create a Competition'}
          </h1>
          {competition && (
            <p className="text-gray-600">
              📍 {competition.location} • 📅 {new Date(competition.date).toLocaleDateString()}
            </p>
          )}
        </div>

        {!competition ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Competition Found</h2>
            <p className="text-gray-600 mb-6">Start by creating a new competition</p>
            <button
              onClick={() => navigate('/competition-wizard')}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create New Competition
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Total Athletes</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAthletes}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Registered</p>
                <p className="text-3xl font-bold text-green-600">{stats.registeredAthletes}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Sessions</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalSessions}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completedSessions}</p>
              </div>
            </div>

            {/* Competition Stages */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Competition Stages</h2>
              
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                return (
                  <div
                    key={stage.number}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6 flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Stage Number */}
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${stage.color}`}
                        >
                          {stage.number}
                        </div>

                        {/* Stage Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{stage.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(stage.status)}`}>
                              {stage.status.replace('-', ' ').charAt(0).toUpperCase() + stage.status.replace('-', ' ').slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{stage.description}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (stage.number === 1) navigate('/competitions');
                          else if (stage.number === 2) navigate('/athletes');
                          else if (stage.number === 3) navigate('/sessions');
                          else if (stage.number === 4) navigate('/technical');
                          else if (stage.number === 5) navigate('/results');
                          else if (stage.number === 6) navigate('/reports');
                        }}
                        className="ml-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
                      >
                        {stage.action}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {index < stages.length - 1 && (
                      <div className="h-1 bg-gradient-to-r from-indigo-600 to-indigo-300 opacity-30"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left group">
                <Users className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-gray-900 mb-1">Bulk Import Athletes</h4>
                <p className="text-sm text-gray-600">Upload CSV file with athlete data</p>
              </button>
              
              <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left group">
                <AlertCircle className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-gray-900 mb-1">Run Live Session</h4>
                <p className="text-sm text-gray-600">Start recording attempt results</p>
              </button>
              
              <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left group">
                <Download className="w-8 h-8 text-indigo-600 mb-3 group-hover:scale-110 transition-transform" />
                <h4 className="font-semibold text-gray-900 mb-1">Export Results</h4>
                <p className="text-sm text-gray-600">Download PDF reports and certificates</p>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompetitionDashboard;
