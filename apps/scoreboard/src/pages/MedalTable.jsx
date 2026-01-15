import { useState, useEffect } from 'react';
import api from '../services/api';
import MedalCard from '../components/MedalCard';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl font-black text-black mb-4 tracking-tight">
              Medal Standings
            </h1>
            <p className="font-body text-lg text-black">
              Competition rankings by country
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Competition Selector */}
        {competitions.length > 0 && (
          <div className="bg-white border border-black p-6">
            <label className="font-ui text-sm font-bold text-black uppercase tracking-widest mb-3 block">
              Competition
            </label>
            <select
              value={selectedCompetition || ''}
              onChange={(e) => setSelectedCompetition(e.target.value)}
              className="w-full px-4 py-4 bg-white text-black border-2 border-black font-ui font-semibold focus:ring-2 focus:ring-black transition-colors"
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
          <div className="bg-white border border-black p-12 text-center">
            <Loader2 className="w-12 h-12 text-black animate-spin mx-auto mb-4" />
            <p className="font-body text-black text-lg">Loading medal standings...</p>
          </div>
        ) : medals.length > 0 ? (
          <div className="space-y-4">
            {medals.map((country, index) => (
              <MedalCard key={country.country} country={country} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-black p-12 text-center">
            <div className="w-20 h-20 bg-black flex items-center justify-center mx-auto mb-6">
              <Medal className="w-10 h-10 text-white" />
            </div>
            <h3 className="font-heading text-3xl font-black text-black mb-3">
              No Medals Yet
            </h3>
            <p className="font-body text-black">
              Complete competition sessions to see medal standings
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
