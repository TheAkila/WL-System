import { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  UserPlus,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Award,
  Shuffle,
  ArrowLeft,
  FileText,
  ClipboardList,
  CheckSquare
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  registered: 'bg-green-100 text-green-800',
  preliminary_pending: 'bg-yellow-100 text-yellow-800',
  preliminary_approved: 'bg-blue-100 text-blue-800',
  preliminary_declined: 'bg-red-100 text-red-800',
  final_pending: 'bg-orange-100 text-orange-800',
  final_approved: 'bg-green-100 text-green-800',
  final_declined: 'bg-red-100 text-red-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  weighed_in: 'bg-purple-100 text-purple-800',
  withdrawn: 'bg-red-100 text-red-800',
  disqualified: 'bg-red-200 text-red-900',
};

const STATUS_LABELS = {
  pending: 'Pending Approval',
  registered: 'Registered',
  preliminary_pending: 'Preliminary Pending',
  preliminary_approved: 'Preliminary Approved',
  preliminary_declined: 'Preliminary Declined',
  final_pending: 'Final Pending',
  final_approved: 'Final Approved',
  final_declined: 'Final Declined',
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
  
  // Section control (card-based selection)
  const [selectedSection, setSelectedSection] = useState(null);
  
  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Entry period controls
  const [entryControls, setEntryControls] = useState({
    registration_open: false,
    preliminary_entry_open: false,
    final_entry_open: false,
  });
  
  // Modal for viewing preliminary entry form
  const [showPreliminaryModal, setShowPreliminaryModal] = useState(false);
  const [selectedPreliminaryReg, setSelectedPreliminaryReg] = useState(null);
  const [editingPreliminary, setEditingPreliminary] = useState(false);
  const [preliminaryAthletes, setPreliminaryAthletes] = useState([]);
  
  // Modal for viewing final entry form
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [selectedFinalReg, setSelectedFinalReg] = useState(null);
  const [editingFinal, setEditingFinal] = useState(false);
  const [finalAthletes, setFinalAthletes] = useState([]);

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
        console.log('Registrations response:', regRes.data);
        console.log('First registration:', regRes.data.data?.[0]);
        console.log('Preliminary athletes:', regRes.data.data?.[0]?.preliminary_athletes);
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
    if (!competition) {
      toast.error('No competition selected');
      return;
    }
    
    try {
      console.log('Updating status:', registrationId, 'to', newStatus);
      const response = await api.put(`/competitions/${competition.id}/registrations/${registrationId}`, {
        status: newStatus,
        ...additionalData
      });
      
      // Show auto-creation notifications
      const data = response.data?.data;
      if (data?.auto_created) {
        toast.success(
          `✅ ${STATUS_LABELS[newStatus]}! Team "${data.auto_created.team}" and ${data.auto_created.athletes_created} athlete(s) created automatically`,
          { duration: 5000 }
        );
      } else if (data?.auto_updated) {
        toast.success(
          `✅ ${STATUS_LABELS[newStatus]}! ${data.auto_updated.athletes_updated} athlete(s) updated automatically`,
          { duration: 4000 }
        );
      } else {
        toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      }
      
      fetchData();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to update status');
    }
  };

  // Delete registration
  const deleteRegistration = async (registrationId) => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) {
      return;
    }

    try {
      console.log('Attempting to delete registration:', registrationId);
      const response = await api.delete(`/registrations/${registrationId}`);
      console.log('Delete response:', response);
      toast.success('Registration deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.message || 'Failed to delete registration';
      toast.error(errorMsg);
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

  // Edit Preliminary Athletes
  const handleEditPreliminary = (reg) => {
    setSelectedPreliminaryReg(reg);
    setPreliminaryAthletes(reg.preliminary_athletes || []);
    setEditingPreliminary(true);
    setShowPreliminaryModal(true);
  };

  const addPreliminaryAthlete = () => {
    setPreliminaryAthletes([...preliminaryAthletes, {
      id: Date.now(),
      competitor_number: preliminaryAthletes.length + 1,
      name: '',
      weight_category: '',
      date_of_birth: '',
      id_number: '',
      best_total: '',
      coach_name: '',
      isNew: true
    }]);
  };

  const updatePreliminaryAthlete = (index, field, value) => {
    const updated = [...preliminaryAthletes];
    updated[index] = { ...updated[index], [field]: value };
    setPreliminaryAthletes(updated);
  };

  const removePreliminaryAthlete = (index) => {
    setPreliminaryAthletes(preliminaryAthletes.filter((_, i) => i !== index));
  };

  const savePreliminaryAthletes = async () => {
    try {
      console.log('🚀 STARTING SAVE PROCESS');
      console.log('Saving preliminary athletes:', preliminaryAthletes);
      console.log('Registration ID:', selectedPreliminaryReg.id);
      console.log('Competition ID:', competition.id);
      console.log('URL will be:', `/competitions/${competition.id}/registrations/${selectedPreliminaryReg.id}/preliminary-athletes`);
      
      const response = await api.put(`/competitions/${competition.id}/registrations/${selectedPreliminaryReg.id}/preliminary-athletes`, {
        athletes: preliminaryAthletes
      });
      
      console.log('✅ Save response:', response.data);
      toast.success('Preliminary athletes updated successfully');
      setEditingPreliminary(false);
      
      // Refresh data to show updated athletes
      await fetchData();
      
      // Close modal after data is refreshed
      setShowPreliminaryModal(false);
      setSelectedPreliminaryReg(null);
    } catch (error) {
      console.error('❌ Save error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      toast.error(error.response?.data?.error?.message || 'Failed to update preliminary athletes');
    }
  };

  // Edit Final Athletes  
  const handleEditFinal = (reg) => {
    setSelectedFinalReg(reg);
    setFinalAthletes(reg.preliminary_athletes || []);
    setShowFinalModal(true);
  };

  const addFinalAthlete = () => {
    setFinalAthletes([...finalAthletes, {
      id: Date.now(),
      competitor_number: finalAthletes.length + 1,
      name: '',
      weight_category: '',
      date_of_birth: '',
      id_number: '',
      best_total: '',
      coach_name: '',
      isNew: true
    }]);
  };

  const updateFinalAthlete = (index, field, value) => {
    const updated = [...finalAthletes];
    updated[index] = { ...updated[index], [field]: value };
    setFinalAthletes(updated);
  };

  const removeFinalAthlete = (index) => {
    setFinalAthletes(finalAthletes.filter((_, i) => i !== index));
  };

  const saveFinalAthletes = async () => {
    try {
      await api.put(`/competitions/${competition.id}/registrations/${selectedFinalReg.id}/final-athletes`, {
        athletes: finalAthletes
      });
      toast.success('Final athletes updated successfully');
      setEditingFinal(false);
      
      // Refresh data to show updated athletes
      await fetchData();
      
      // Close modal after data is refreshed
      setShowFinalModal(false);
      setSelectedFinalReg(null);
    } catch (error) {
      toast.error('Failed to update final athletes');
    }
  };

  // Filter registrations by section
  const getRegistrationsBySection = (section) => {
    const search = searchTerm.toLowerCase();
    let sectionRegs = registrations;

    if (section === 'registrations') {
      // Show all registrations including those that have moved to preliminary/final stages
      sectionRegs = registrations.filter(reg => 
        ['pending', 'registered', 'preliminary_pending', 'preliminary_submitted', 'preliminary_approved', 'preliminary_declined',
         'final_pending', 'final_submitted', 'final_approved', 'final_declined'].includes(reg.status)
      );
    } else if (section === 'preliminary') {
      // Show preliminary entries including those that have moved to final stage
      sectionRegs = registrations.filter(reg => 
        ['preliminary_pending', 'preliminary_submitted', 'preliminary_approved', 'preliminary_declined',
         'final_pending', 'final_submitted', 'final_approved', 'final_declined'].includes(reg.status)
      );
    } else if (section === 'final') {
      sectionRegs = registrations.filter(reg => 
        ['final_pending', 'final_submitted', 'final_approved', 'final_declined'].includes(reg.status)
      );
    }

    // Apply filters
    return sectionRegs.filter(reg => {
      if (genderFilter !== 'all' && reg.gender !== genderFilter) return false;
      if (search) {
        return (
          reg.athlete_name?.toLowerCase().includes(search) ||
          reg.email?.toLowerCase().includes(search) ||
          reg.club_name?.toLowerCase().includes(search) ||
          reg.team_manager_name?.toLowerCase().includes(search)
        );
      }
      return true;
    });
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
    if (genderFilter !== 'all' && reg.gender !== genderFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        reg.athlete_name?.toLowerCase().includes(search) ||
        reg.email?.toLowerCase().includes(search) ||
        reg.club_name?.toLowerCase().includes(search) ||
        reg.team_manager_name?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Get current section registrations
  const currentSectionRegistrations = getRegistrationsBySection(selectedSection).filter(reg => {
    // Apply global filters
    if (statusFilter !== 'all' && reg.status !== statusFilter) return false;
    if (genderFilter !== 'all' && reg.gender !== genderFilter) return false;
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

      {/* Show section cards if no section selected */}
      {!selectedSection && (
        <>
          {/* Entry Period Controls */}
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6 border border-slate-200 dark:border-zinc-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Entry Period Controls</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Registration */}
              <div className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Registration</h3>
                <p className={`text-sm mb-3 font-medium ${entryControls.registration_open ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {entryControls.registration_open ? '✓ Open' : '✗ Closed'}
                </p>
                <button
                  onClick={() => toggleEntryPeriod('registration', !entryControls.registration_open)}
                  className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all text-white ${
                    entryControls.registration_open 
                      ? 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg' 
                      : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {entryControls.registration_open ? 'Close' : 'Open'}
                </button>
              </div>

              {/* Preliminary Entry */}
              <div className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Preliminary Entry</h3>
                <p className={`text-sm mb-3 font-medium ${entryControls.preliminary_entry_open ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {entryControls.preliminary_entry_open ? '✓ Open' : '✗ Closed'}
                </p>
                <button
                  onClick={() => toggleEntryPeriod('preliminary', !entryControls.preliminary_entry_open)}
                  className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all text-white ${
                    entryControls.preliminary_entry_open 
                      ? 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg' 
                      : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {entryControls.preliminary_entry_open ? 'Close' : 'Open'}
                </button>
              </div>

              {/* Final Entry */}
              <div className="p-4 border border-slate-200 dark:border-zinc-700 rounded-lg">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Final Entry</h3>
                <p className={`text-sm mb-3 font-medium ${entryControls.final_entry_open ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {entryControls.final_entry_open ? '✓ Open' : '✗ Closed'}
                </p>
                <button
                  onClick={() => toggleEntryPeriod('final', !entryControls.final_entry_open)}
                  className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all text-white ${
                    entryControls.final_entry_open 
                      ? 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg' 
                      : 'bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg'
                  }`}
                >
                  {entryControls.final_entry_open ? 'Close' : 'Open'}
                </button>
              </div>
            </div>
          </div>

          {/* Section Selection Cards */}
          <div className="card card-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
                Select Registration Section
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 mt-1">
                Choose a section to view and manage registrations
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Initial Registrations Card */}
              <button
                onClick={() => setSelectedSection('registrations')}
                className="p-6 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-8 h-8 text-green-600" />
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    {getRegistrationsBySection('registrations').length}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-green-600">
                  Initial Registrations
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  View and manage new athlete registrations
                </p>
              </button>

              {/* Preliminary Entries Card */}
              <button
                onClick={() => setSelectedSection('preliminary')}
                className="p-6 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <ClipboardList className="w-8 h-8 text-blue-600" />
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {getRegistrationsBySection('preliminary').length}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600">
                  Preliminary Entries
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Manage entry totals and preliminary submissions
                </p>
              </button>

              {/* Final Entries Card */}
              <button
                onClick={() => setSelectedSection('final')}
                className="p-6 border-2 border-slate-200 dark:border-zinc-700 rounded-xl hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <CheckSquare className="w-8 h-8 text-purple-600" />
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    {getRegistrationsBySection('final').length}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-purple-600">
                  Final Entries
                </h3>
                <p className="text-sm text-slate-600 dark:text-zinc-400">
                  Review opening attempts and lot numbers
                </p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Show selected section details */}
      {selectedSection && (
        <>
          {/* Back Button and Section Header */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedSection(null)}
              className="btn btn-secondary flex items-center justify-center"
              title="Back to Sections"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedSection === 'registrations' && 'Initial Registrations'}
                {selectedSection === 'preliminary' && 'Preliminary Entries'}
                {selectedSection === 'final' && 'Final Entries'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedSection === 'registrations' && 'Manage new athlete registrations'}
                {selectedSection === 'preliminary' && 'Review entry totals and preliminary submissions'}
                {selectedSection === 'final' && 'Review opening attempts and assign lot numbers'}
              </p>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="card card-lg overflow-hidden">
            <div className="overflow-x-auto">
              {selectedSection === 'registrations' && (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-700">
                  <thead className="bg-slate-50 dark:bg-zinc-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Team Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Manager Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Phone Number</th>                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Age Category</th>                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                    {currentSectionRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <Users className="w-12 h-12 text-slate-300 dark:text-zinc-600 mb-3" />
                            <p className="text-slate-500 dark:text-zinc-400 font-medium">No registrations yet</p>
                            <p className="text-sm text-slate-400 dark:text-zinc-500">Team registrations will appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentSectionRegistrations.map((reg) => (
                        <RegistrationRow key={reg.id} reg={reg} selectedIds={selectedIds} toggleSelection={toggleSelection} updateStatus={updateStatus} deleteRegistration={deleteRegistration} STATUS_COLORS={STATUS_COLORS} STATUS_LABELS={STATUS_LABELS} createAthlete={createAthlete} />
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {selectedSection === 'preliminary' && (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-700">
                  <thead className="bg-slate-100 dark:bg-zinc-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Team Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Manager Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-800 divide-y divide-slate-200 dark:divide-zinc-700">
                    {currentSectionRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-zinc-400">
                            <ClipboardList size={48} className="opacity-30" />
                            <p className="font-medium">No preliminary entries yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentSectionRegistrations.map((reg) => (
                        <PreliminaryEntryRow key={reg.id} reg={reg} updateStatus={updateStatus} deleteRegistration={deleteRegistration} STATUS_COLORS={STATUS_COLORS} STATUS_LABELS={STATUS_LABELS} onView={() => { setSelectedPreliminaryReg(reg); setShowPreliminaryModal(true); }} />
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {selectedSection === 'final' && (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-zinc-700">
                  <thead className="bg-slate-100 dark:bg-zinc-900">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Team Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-zinc-800 divide-y divide-slate-200 dark:divide-zinc-700">
                    {currentSectionRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-zinc-400">
                            <FileText size={48} className="opacity-30" />
                            <p className="font-medium">No final entries yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentSectionRegistrations.map((reg) => (
                        <FinalEntryRow 
                          key={reg.id} 
                          reg={reg} 
                          updateStatus={updateStatus} 
                          deleteRegistration={deleteRegistration} 
                          createAthlete={createAthlete} 
                          onView={() => { 
                            setSelectedFinalReg(reg); 
                            setShowFinalModal(true); 
                          }}
                          STATUS_COLORS={STATUS_COLORS} 
                          STATUS_LABELS={STATUS_LABELS} 
                        />
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {/* Preliminary Entry Form Modal */}
      {showPreliminaryModal && selectedPreliminaryReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">ENTRY FORM (Preliminary)</h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">{competition?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowPreliminaryModal(false);
                  setSelectedPreliminaryReg(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Club/Team Information Section */}
              <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">Team Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Name of the Club/Institute/School:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedPreliminaryReg.club_name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Men / Women:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">
                      {selectedPreliminaryReg.gender || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Age Category:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedPreliminaryReg.age_category || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Address:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedPreliminaryReg.athlete_notes || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Telephone No:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedPreliminaryReg.team_manager_phone || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Athletes/Competitors Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Competitors</h3>
                  {!editingPreliminary && selectedPreliminaryReg.preliminary_submitted_at && (
                    <button
                      onClick={() => {
                        setPreliminaryAthletes(selectedPreliminaryReg.preliminary_athletes || []);
                        setEditingPreliminary(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Edit Athletes
                    </button>
                  )}
                  {editingPreliminary && (
                    <button
                      onClick={addPreliminaryAthlete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      + Add Athlete
                    </button>
                  )}
                </div>
                {!selectedPreliminaryReg.preliminary_submitted_at ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
                    <ClipboardList size={48} className="mx-auto text-amber-600 dark:text-amber-400 mb-3 opacity-50" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Preliminary Entry Not Yet Submitted
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      The team has registered but hasn't submitted their preliminary entry form with athlete details yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-zinc-700 rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-zinc-900">
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">C/NO.</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">CATEGORY</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">NAME OF THE COMPETITOR</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">DATE OF BIRTH</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">ID NUMBER</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">BEST TOTAL</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">COACH</th>
                          {editingPreliminary && <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">ACTIONS</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-800">
                        {(() => {
                          // Get preliminary athletes - use editing state if in edit mode
                          const athletes = editingPreliminary ? preliminaryAthletes : (selectedPreliminaryReg.preliminary_athletes || []);
                          
                          if (athletes.length === 0) {
                            return (
                              <tr>
                                <td colSpan={editingPreliminary ? "8" : "7"} className="px-6 py-8">
                                  <div className="text-center">
                                    <p className="text-slate-700 dark:text-zinc-300 font-medium mb-2">
                                      No athletes added yet
                                    </p>
                                    {editingPreliminary && (
                                      <button
                                        onClick={addPreliminaryAthlete}
                                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                      >
                                        + Add First Athlete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                          
                          return athletes.map((athlete, index) => (
                            <tr key={athlete.id || index} className="border-t border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50">
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-center font-medium text-slate-900 dark:text-white">
                                {editingPreliminary ? (
                                  <input
                                    type="number"
                                    value={athlete.competitor_number || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'competitor_number', e.target.value)}
                                    className="w-16 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-center"
                                  />
                                ) : (
                                  String(athlete.competitor_number || 0).padStart(2, '0')
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                                {editingPreliminary ? (
                                  <input
                                    type="text"
                                    value={athlete.weight_category || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'weight_category', e.target.value)}
                                    placeholder="e.g. 55"
                                    className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.weight_category ? `${athlete.weight_category}kg` : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-900 dark:text-white">
                                {editingPreliminary ? (
                                  <input
                                    type="text"
                                    value={athlete.name || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.name || '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingPreliminary ? (
                                  <input
                                    type="date"
                                    value={athlete.date_of_birth || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'date_of_birth', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.date_of_birth ? new Date(athlete.date_of_birth).toLocaleDateString() : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingPreliminary ? (
                                  <input
                                    type="text"
                                    value={athlete.id_number || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'id_number', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.id_number || '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm font-bold text-slate-900 dark:text-white">
                                {editingPreliminary ? (
                                  <input
                                    type="number"
                                    value={athlete.best_total || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'best_total', e.target.value)}
                                    className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.best_total ? `${athlete.best_total}kg` : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingPreliminary ? (
                                  <input
                                    type="text"
                                    value={athlete.coach_name || ''}
                                    onChange={(e) => updatePreliminaryAthlete(index, 'coach_name', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.coach_name || '-'
                                )}
                              </td>
                              {editingPreliminary && (
                                <td className="px-3 py-3 text-sm">
                                  <button
                                    onClick={() => removePreliminaryAthlete(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Status and Submission Info */}
              <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedPreliminaryReg.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[selectedPreliminaryReg.status] || selectedPreliminaryReg.status}
                    </span>
                  </div>
                  {selectedPreliminaryReg.preliminary_submitted_at && (
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Submitted At</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedPreliminaryReg.preliminary_submitted_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
              {!editingPreliminary && selectedPreliminaryReg?.status === 'preliminary_pending' && (!selectedPreliminaryReg?.preliminary_athletes || selectedPreliminaryReg.preliminary_athletes.length === 0) && (
                <div className="px-6 pt-4 pb-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ <strong>No athlete data found!</strong> Click "Edit Athletes" to add athletes before approving, or athletes will not be created.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 p-6">
              {editingPreliminary ? (
                <>
                  <button
                    onClick={() => {
                      setEditingPreliminary(false);
                      setPreliminaryAthletes([]);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-900 dark:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={savePreliminaryAthletes}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  {selectedPreliminaryReg.status === 'preliminary_pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateStatus(selectedPreliminaryReg.id, 'preliminary_declined');
                          setShowPreliminaryModal(false);
                          setSelectedPreliminaryReg(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                      >
                        Decline Entry
                      </button>
                      <button
                        onClick={() => {
                          const athletes = selectedPreliminaryReg.preliminary_athletes || [];
                          if (athletes.length === 0) {
                            const confirm = window.confirm(
                              '⚠️ WARNING: No athlete data found!\n\n' +
                              'Approving without athletes means no athletes will be created in the system.\n\n' +
                              'RECOMMENDED: Click "Edit Athletes" to add athlete data first, then approve.\n\n' +
                              'Do you still want to approve without athletes?'
                            );
                            if (!confirm) return;
                          }
                          updateStatus(selectedPreliminaryReg.id, 'preliminary_approved');
                          setShowPreliminaryModal(false);
                          setSelectedPreliminaryReg(null);
                        }}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                      >
                        Approve Entry
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowPreliminaryModal(false);
                      setSelectedPreliminaryReg(null);
                      setEditingPreliminary(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-900 dark:text-white font-medium transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Entry Form Modal */}
      {showFinalModal && selectedFinalReg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-zinc-700 sticky top-0 bg-white dark:bg-zinc-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">ENTRY FORM (Final)</h2>
                <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1">{competition?.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowFinalModal(false);
                  setSelectedFinalReg(null);
                }}
                className="text-slate-500 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Club/Team Information Section */}
              <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4 text-lg">Team Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Name of the Club/Institute/School:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedFinalReg.club_name || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Men / Women:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white capitalize">
                      {selectedFinalReg.gender || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Age Category:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedFinalReg.age_category || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Telephone No:</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedFinalReg.team_manager_phone || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Athletes/Competitors Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Competitors</h3>
                  {!editingFinal && selectedFinalReg.final_submitted_at && (
                    <button
                      onClick={() => {
                        setFinalAthletes(selectedFinalReg.preliminary_athletes || []);
                        setEditingFinal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Edit Athletes
                    </button>
                  )}
                  {editingFinal && (
                    <button
                      onClick={addFinalAthlete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      + Add Athlete
                    </button>
                  )}
                </div>
                {!selectedFinalReg.final_submitted_at ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
                    <ClipboardList size={48} className="mx-auto text-amber-600 dark:text-amber-400 mb-3 opacity-50" />
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                      Final Entry Not Yet Submitted
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      The team has not submitted their final entry with opening attempts yet.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-200 dark:border-zinc-700 rounded-lg">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-zinc-900">
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">C/NO.</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">CATEGORY</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">NAME OF THE COMPETITOR</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">DATE OF BIRTH</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">ID NUMBER</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">BEST TOTAL</th>
                          <th className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">COACH</th>
                          {editingFinal && <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700 dark:text-zinc-300">ACTIONS</th>}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-800">
                        {(() => {
                          const athletes = editingFinal ? finalAthletes : (selectedFinalReg.preliminary_athletes || []);
                          
                          if (athletes.length === 0) {
                            return (
                              <tr>
                                <td colSpan={editingFinal ? "8" : "7"} className="px-6 py-8">
                                  <div className="text-center">
                                    <p className="text-slate-700 dark:text-zinc-300 font-medium mb-2">
                                      No athletes added yet
                                    </p>
                                    {editingFinal && (
                                      <button
                                        onClick={addFinalAthlete}
                                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                      >
                                        + Add First Athlete
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                          
                          return athletes.map((athlete, index) => (
                            <tr key={athlete.id || index} className="border-t border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50">
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-center font-medium text-slate-900 dark:text-white">
                                {editingFinal ? (
                                  <input
                                    type="number"
                                    value={athlete.competitor_number || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'competitor_number', e.target.value)}
                                    className="w-16 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700 text-center"
                                  />
                                ) : (
                                  String(athlete.competitor_number || 0).padStart(2, '0')
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm font-semibold text-slate-900 dark:text-white">
                                {editingFinal ? (
                                  <input
                                    type="text"
                                    value={athlete.weight_category || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'weight_category', e.target.value)}
                                    placeholder="e.g. 55"
                                    className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.weight_category ? `${athlete.weight_category}kg` : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-900 dark:text-white">
                                {editingFinal ? (
                                  <input
                                    type="text"
                                    value={athlete.name || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'name', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.name || '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingFinal ? (
                                  <input
                                    type="date"
                                    value={athlete.date_of_birth || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'date_of_birth', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.date_of_birth ? new Date(athlete.date_of_birth).toLocaleDateString() : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingFinal ? (
                                  <input
                                    type="text"
                                    value={athlete.id_number || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'id_number', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.id_number || '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm font-bold text-slate-900 dark:text-white">
                                {editingFinal ? (
                                  <input
                                    type="number"
                                    value={athlete.best_total || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'best_total', e.target.value)}
                                    className="w-20 px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.best_total ? `${athlete.best_total}kg` : '-'
                                )}
                              </td>
                              <td className="border-r border-slate-200 dark:border-zinc-700 px-3 py-3 text-sm text-slate-600 dark:text-zinc-400">
                                {editingFinal ? (
                                  <input
                                    type="text"
                                    value={athlete.coach_name || ''}
                                    onChange={(e) => updateFinalAthlete(index, 'coach_name', e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
                                  />
                                ) : (
                                  athlete.coach_name || '-'
                                )}
                              </td>
                              {editingFinal && (
                                <td className="px-3 py-3 text-sm">
                                  <button
                                    onClick={() => removeFinalAthlete(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Status and Submission Info */}
              <div className="bg-slate-50 dark:bg-zinc-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${STATUS_COLORS[selectedFinalReg.status] || 'bg-gray-100 text-gray-800'}`}>
                      {STATUS_LABELS[selectedFinalReg.status] || selectedFinalReg.status}
                    </span>
                  </div>
                  {selectedFinalReg.final_submitted_at && (
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-600 dark:text-zinc-400 mb-1">Submitted At</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {new Date(selectedFinalReg.final_submitted_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900">
              {!editingFinal && selectedFinalReg?.status === 'final_pending' && (!selectedFinalReg?.preliminary_athletes || selectedFinalReg.preliminary_athletes.length === 0) && (
                <div className="px-6 pt-4 pb-2">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      ⚠️ <strong>No athlete data found!</strong> Click "Edit Athletes" to add athletes before approving, or athletes will not be created/updated.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 p-6">
              {editingFinal ? (
                <>
                  <button
                    onClick={() => {
                      setEditingFinal(false);
                      setFinalAthletes([]);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-900 dark:text-white font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveFinalAthletes}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  {selectedFinalReg?.status === 'final_pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateStatus(selectedFinalReg.id, 'final_declined');
                          setShowFinalModal(false);
                          setSelectedFinalReg(null);
                          setFinalAthletes([]);
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                      >
                        Decline Entry
                      </button>
                      <button
                        onClick={() => {
                          const athletes = selectedFinalReg.preliminary_athletes || [];
                          if (athletes.length === 0) {
                            const confirm = window.confirm(
                              '⚠️ WARNING: No athlete data found!\n\n' +
                              'Approving without athletes means no athletes will be created/updated in the system.\n\n' +
                              'RECOMMENDED: Click "Edit Athletes" to add athlete data first, then approve.\n\n' +
                              'Do you still want to approve without athletes?'
                            );
                            if (!confirm) return;
                          }
                          updateStatus(selectedFinalReg.id, 'final_approved');
                          setShowFinalModal(false);
                          setSelectedFinalReg(null);
                          setFinalAthletes([]);
                        }}
                        className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                      >
                        Approve Entry
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setShowFinalModal(false);
                      setSelectedFinalReg(null);
                      setEditingFinal(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-slate-900 dark:text-white font-medium transition-colors"
                  >
                    Close
                  </button>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function RegistrationRow({ reg, selectedIds, toggleSelection, updateStatus, deleteRegistration, STATUS_COLORS, STATUS_LABELS, createAthlete }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
      {/* Team Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {reg.is_team_registration && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              TEAM
            </span>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {reg.club_name || reg.team_manager_name || 'Unknown Team'}
            </p>
            {reg.team_size > 0 && (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Team Size: {reg.team_size} | Registered: {reg.registered_athletes_count || 0}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Manager Name */}
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-slate-900 dark:text-white">
            {reg.team_manager_name || '-'}
          </p>
          {reg.team_manager_email && (
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {reg.team_manager_email}
            </p>
          )}
        </div>
      </td>

      {/* Phone Number */}
      <td className="px-6 py-4">
        <p className="text-slate-900 dark:text-white font-mono">
          {reg.team_manager_phone || '-'}
        </p>
      </td>

      {/* Age Category */}
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {reg.age_category || '-'}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[reg.status] || reg.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {reg.status === 'pending' && (
            <button
              onClick={() => updateStatus(reg.id, 'registered')}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
              title="Approve Registration"
            >
              <CheckCircle size={20} />
            </button>
          )}
          <button
            onClick={() => deleteRegistration(reg.id)}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md"
            title="Delete Registration"
          >
            <XCircle size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Preliminary Entry Row Component
function PreliminaryEntryRow({ reg, updateStatus, deleteRegistration, STATUS_COLORS, STATUS_LABELS, onView }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
      {/* Team Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {reg.is_team_registration && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              TEAM
            </span>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {reg.club_name || reg.team_manager_name || 'Unknown Team'}
            </p>
            {reg.team_size > 0 && (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Team Size: {reg.team_size}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Manager Name */}
      <td className="px-6 py-4">
        <p className="font-medium text-slate-900 dark:text-white">
          {reg.team_manager_name || '-'}
        </p>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[reg.status] || reg.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onView}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
            title="View Entry Form"
          >
            <FileText size={20} />
          </button>
          {reg.status === 'preliminary_pending' && (
            <button
              onClick={() => updateStatus(reg.id, 'preliminary_approved')}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
              title="Approve Preliminary Entry"
            >
              <CheckCircle size={20} />
            </button>
          )}
          <button
            onClick={() => deleteRegistration(reg.id)}
            className="w-10 h-10 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md"
            title="Delete Registration"
          >
            <XCircle size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Final Entry Row Component
function FinalEntryRow({ reg, updateStatus, deleteRegistration, createAthlete, onView, STATUS_COLORS, STATUS_LABELS }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors">
      {/* Team Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {reg.is_team_registration && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              TEAM
            </span>
          )}
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">
              {reg.club_name || reg.team_manager_name || 'Unknown Team'}
            </p>
            {reg.lot_number && (
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Lot #{reg.lot_number}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[reg.status] || 'bg-gray-100 text-gray-800'}`}>
          {STATUS_LABELS[reg.status] || reg.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onView}
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-sm"
            title="View Final Entry Form"
          >
            <FileText size={20} />
          </button>
          {reg.status === 'final_pending' && (
            <button
              onClick={() => updateStatus(reg.id, 'final_approved')}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors shadow-sm"
              title="Approve Final Entry"
            >
              <CheckCircle size={20} />
            </button>
          )}
          {reg.wl_athlete_id && (
            <div className="p-2 rounded-lg bg-emerald-500 text-white" title="Athlete Created">
              <Award size={20} />
            </div>
          )}
          <button
            onClick={() => deleteRegistration(reg.id)}
            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
            title="Delete Registration"
          >
            <XCircle size={20} />
          </button>
        </div>
      </td>
    </tr>
  );
}
