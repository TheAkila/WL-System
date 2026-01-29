import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Award,
  Shuffle
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  registered: 'bg-gray-100 text-gray-800',
  preliminary_pending: 'bg-yellow-100 text-yellow-800',
  preliminary_approved: 'bg-blue-100 text-blue-800',
  final_pending: 'bg-orange-100 text-orange-800',
  final_approved: 'bg-green-100 text-green-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  weighed_in: 'bg-purple-100 text-purple-800',
  withdrawn: 'bg-red-100 text-red-800',
  disqualified: 'bg-red-200 text-red-900',
};

const STATUS_LABELS = {
  registered: 'Registered',
  preliminary_pending: 'Preliminary Pending',
  preliminary_approved: 'Preliminary Approved',
  final_pending: 'Final Pending',
  final_approved: 'Final Approved',
  confirmed: 'Confirmed',
  weighed_in: 'Weighed In',
  withdrawn: 'Withdrawn',
  disqualified: 'Disqualified',
};

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [competition, setCompetition] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Entry period controls
  const [entryControls, setEntryControls] = useState({
    registration_open: false,
    preliminary_entry_open: false,
    final_entry_open: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get current competition
      const compRes = await api.get('/competitions/current');
      const comp = compRes.data.data;
      setCompetition(comp);
      
      if (comp) {
        setEntryControls({
          registration_open: comp.registration_open || false,
          preliminary_entry_open: comp.preliminary_entry_open || false,
          final_entry_open: comp.final_entry_open || false,
        });
        
        // Get registrations
        const regRes = await api.get(`/competitions/${comp.id}/registrations`);
        setRegistrations(regRes.data.data || []);
        
        // Get stats
        const statsRes = await api.get(`/competitions/${comp.id}/registrations/stats`);
        setStats(statsRes.data.data);
        
        // Get sessions
        const sessRes = await api.get('/sessions');
        setSessions(sessRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  // Toggle entry periods
  const toggleEntryPeriod = async (period, open) => {
    if (!competition) return;
    
    try {
      const endpoint = {
        registration: 'registration',
        preliminary: 'preliminary-entry',
        final: 'final-entry',
      }[period];
      
      await api.put(`/competitions/${competition.id}/${endpoint}`, { open });
      
      setEntryControls(prev => ({
        ...prev,
        [`${period === 'preliminary' ? 'preliminary_entry' : period === 'final' ? 'final_entry' : 'registration'}_open`]: open
      }));
      
      toast.success(`${period.charAt(0).toUpperCase() + period.slice(1)} ${open ? 'opened' : 'closed'}`);
    } catch (error) {
      toast.error('Failed to update entry period');
    }
  };

  // Update single registration status
  const updateStatus = async (registrationId, newStatus, additionalData = {}) => {
    try {
      await api.put(`/competitions/registrations/${registrationId}/status`, {
        status: newStatus,
        ...additionalData
      });
      
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Create athlete from registration
  const createAthlete = async (registrationId, sessionId = null) => {
    try {
      await api.post(`/competitions/registrations/${registrationId}/create-athlete`, {
        session_id: sessionId
      });
      
      toast.success('Athlete created successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create athlete');
    }
  };

  // Bulk approve
  const bulkApprove = async (newStatus, createAthletes = false) => {
    if (selectedIds.length === 0) {
      toast.error('No registrations selected');
      return;
    }

    try {
      await api.post(`/competitions/${competition.id}/registrations/bulk-approve`, {
        registration_ids: selectedIds,
        new_status: newStatus,
        create_athletes: createAthletes
      });
      
      toast.success(`${selectedIds.length} registrations updated`);
      setSelectedIds([]);
      setShowBulkActions(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to bulk approve');
    }
  };

  // Draw lot numbers
  const drawLots = async () => {
    if (!competition) return;
    
    if (!confirm('This will randomly assign lot numbers to all approved athletes. Continue?')) {
      return;
    }

    try {
      const res = await api.post(`/competitions/${competition.id}/draw-lots`, {
        shuffle: true
      });
      
      toast.success(`Lot numbers assigned to ${res.data.data.count} athletes`);
      fetchData();
    } catch (error) {
      toast.error('Failed to draw lot numbers');
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
    if (genderFilter !== 'all' && reg.gender !== genderFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        reg.user?.name?.toLowerCase().includes(search) ||
        reg.user?.email?.toLowerCase().includes(search) ||
        reg.club_name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === filteredRegistrations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRegistrations.map(r => r.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Competition Found</h3>
        <p className="text-gray-500">Create a competition first to manage registrations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Website Registrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage athlete registrations from Lifting Social website
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Entry Period Controls */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Entry Period Controls
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Registration */}
          <div className={`p-4 rounded-lg border-2 ${entryControls.registration_open ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Registration</h3>
                <p className="text-sm text-gray-500">Allow new registrations</p>
              </div>
              <button
                onClick={() => toggleEntryPeriod('registration', !entryControls.registration_open)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  entryControls.registration_open 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {entryControls.registration_open ? 'Close' : 'Open'}
              </button>
            </div>
          </div>

          {/* Preliminary Entry */}
          <div className={`p-4 rounded-lg border-2 ${entryControls.preliminary_entry_open ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Preliminary Entry</h3>
                <p className="text-sm text-gray-500">Entry total submission</p>
              </div>
              <button
                onClick={() => toggleEntryPeriod('preliminary', !entryControls.preliminary_entry_open)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  entryControls.preliminary_entry_open 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                {entryControls.preliminary_entry_open ? 'Close' : 'Open'}
              </button>
            </div>
          </div>

          {/* Final Entry */}
          <div className={`p-4 rounded-lg border-2 ${entryControls.final_entry_open ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Final Entry</h3>
                <p className="text-sm text-gray-500">Opening attempts</p>
              </div>
              <button
                onClick={() => toggleEntryPeriod('final', !entryControls.final_entry_open)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  entryControls.final_entry_open 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                {entryControls.final_entry_open ? 'Close' : 'Open'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Registrations</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingApproval}</p>
                <p className="text-sm text-gray-500">Pending Approval</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.readyForCompetition}</p>
                <p className="text-sm text-gray-500">Ready to Compete</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">M</div>
              <div>
                <p className="text-2xl font-bold">{stats.byGender?.male || 0}</p>
                <p className="text-sm text-gray-500">Male Athletes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">F</div>
              <div>
                <p className="text-2xl font-bold">{stats.byGender?.female || 0}</p>
                <p className="text-sm text-gray-500">Female Athletes</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email, or club..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          {/* Lot Draw Button */}
          <button
            onClick={drawLots}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Shuffle size={18} />
            Draw Lots
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-indigo-700 dark:text-indigo-300">
                {selectedIds.length} registration(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => bulkApprove('preliminary_approved')}
                  className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                >
                  Approve Preliminary
                </button>
                <button
                  onClick={() => bulkApprove('final_approved', true)}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                >
                  Approve Final & Create Athletes
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="btn btn-sm btn-secondary"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Registrations Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700">
          <thead className="bg-gray-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Athlete</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entry Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Openers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-700 ${selectedIds.includes(reg.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(reg.id)}
                    onChange={() => toggleSelection(reg.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{reg.user?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{reg.user?.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reg.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                      {reg.gender === 'male' ? 'M' : 'F'}
                    </span>
                    <span className="ml-2 font-medium">{reg.confirmed_weight_category || reg.weight_category || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {reg.club_name || '-'}
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {reg.entry_total ? `${reg.entry_total}kg` : '-'}
                </td>
                <td className="px-4 py-3 text-sm">
                  {(reg.snatch_opener || reg.cnj_opener) ? (
                    <div>
                      <span className="text-blue-600">S: {reg.snatch_opener || '-'}</span>
                      <span className="mx-1">/</span>
                      <span className="text-green-600">CJ: {reg.cnj_opener || '-'}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-800'}`}>
                    {STATUS_LABELS[reg.status] || reg.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">
                  {reg.lot_number || '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* Status Actions */}
                    {reg.status === 'preliminary_pending' && (
                      <button
                        onClick={() => updateStatus(reg.id, 'preliminary_approved')}
                        className="text-blue-600 hover:text-blue-800"
                        title="Approve Preliminary"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {reg.status === 'final_pending' && (
                      <button
                        onClick={() => updateStatus(reg.id, 'final_approved')}
                        className="text-green-600 hover:text-green-800"
                        title="Approve Final"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    {/* Create Athlete */}
                    {['final_approved', 'confirmed'].includes(reg.status) && !reg.wl_athlete_id && (
                      <button
                        onClick={() => createAthlete(reg.id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="Create Athlete for Competition"
                      >
                        <UserPlus size={18} />
                      </button>
                    )}
                    {reg.wl_athlete_id && (
                      <Award size={18} className="text-green-500" title="Athlete Created" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRegistrations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Registrations Found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || genderFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Registrations from the website will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
