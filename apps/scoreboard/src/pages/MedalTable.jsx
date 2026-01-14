import { useState, useEffect } from 'react';
import api from '../services/api';
import MedalCard from '../components/MedalCard';

export default function MedalTable() {
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    fetchCompetitions();
  }, []);

  useEffect(() => {
    if (selectedCompetition) {
      fetchMedals();
    }
  }, [selectedCompetition]);

  const fetchCompetitions = async () => {
    try {
      // For now, just get active sessions and extract competitions
      const response = await api.get('/technical/sessions/active');
      const sessions = response.data.data || [];
      
      const uniqueCompetitions = sessions.reduce((acc, session) => {
        if (session.competition && !acc.find(c => c.id === session.competition.id)) {
          acc.push(session.competition);
        }
        return acc;
      }, []);

      setCompetitions(uniqueCompetitions);
      if (uniqueCompetitions.length > 0) {
        setSelectedCompetition(uniqueCompetitions[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
    }
  };

  const fetchMedals = async () => {
    setLoading(true);
    try {
      // Calculate medals from completed sessions
      const response = await api.get('/technical/sessions/active');
      const sessions = response.data.data || [];
      
      const completedSessions = sessions.filter(
        s => s.status === 'completed' && s.competition_id === selectedCompetition
      );

      // For each session, get top 3 and count medals by country
      const medalCount = {};

      for (const session of completedSessions) {
        try {
          const leaderboardRes = await api.get(`/technical/sessions/${session.id}/leaderboard`);
          const athletes = leaderboardRes.data.data || [];
          
          // Top 3
          const top3 = athletes.slice(0, 3);
          top3.forEach((athlete, index) => {
            const country = athlete.country || 'Unknown';
            if (!medalCount[country]) {
              medalCount[country] = { gold: 0, silver: 0, bronze: 0, total: 0 };
            }
            
            if (index === 0) medalCount[country].gold++;
            else if (index === 1) medalCount[country].silver++;
            else if (index === 2) medalCount[country].bronze++;
            
            medalCount[country].total++;
          });
        } catch (err) {
          console.error(`Failed to fetch leaderboard for session ${session.id}`);
        }
      }

      // Convert to array and sort
      const medalArray = Object.entries(medalCount).map(([country, counts]) => ({
        country,
        ...counts,
      }));

      medalArray.sort((a, b) => {
        if (b.gold !== a.gold) return b.gold - a.gold;
        if (b.silver !== a.silver) return b.silver - a.silver;
        if (b.bronze !== a.bronze) return b.bronze - a.bronze;
        return 0;
      });

      setMedals(medalArray);
    } catch (error) {
      console.error('Failed to calculate medals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-2">🏅 Medal Table</h2>
        <p className="text-sm opacity-90">Competition standings by country</p>
      </div>

      {/* Competition Selector */}
      {competitions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Competition
          </label>
          <select
            value={selectedCompetition || ''}
            onChange={(e) => setSelectedCompetition(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {competitions.map((comp) => (
              <option key={comp.id} value={comp.id}>
                {comp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Medal Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin text-4xl mb-3">⏳</div>
          <p className="text-gray-600">Loading medals...</p>
        </div>
      ) : medals.length > 0 ? (
        <div className="space-y-3">
          {medals.map((country, index) => (
            <MedalCard key={country.country} country={country} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <div className="text-5xl mb-3">🏅</div>
          <p>No medals awarded yet</p>
          <p className="text-sm mt-2">Complete sessions to see medal standings</p>
        </div>
      )}
    </div>
  );
}
