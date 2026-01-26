import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';


export default function Athletes() {
  const [athletes, setAthletes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    gender: 'male',
    weight_category: '',
    session_id: '',
    team_id: '',
    id_number: '',
    registration_number: '',
    best_total: '',
    coach_name: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchAthletes();
    fetchSessions();
    fetchTeams();
  }, []);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/athletes');
      setAthletes(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load athletes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await api.get('/sessions');
      const data = response.data.data || [];
      console.log('Loaded sessions:', data.length);
      setSessions(data);
      if (data.length === 0) {
        console.warn('No sessions available');
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
      setSessions([]);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      const data = response.data.data || [];
      console.log('Loaded teams:', data.length);
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
      toast.error('Failed to load teams');
      setTeams([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error('Athlete name is required');
      return;
    }
    if (!formData.gender) {
      toast.error('Gender is required');
      return;
    }
    if (!formData.weight_category) {
      toast.error('Weight category is required');
      return;
    }
    if (!formData.session_id) {
      toast.error('Please select a session');
      return;
    }

    try {
      // Ensure we're sending the correct data format
      const submitData = {
        name: formData.name.trim(),
        birth_date: formData.birth_date || null,
        gender: formData.gender,
        weight_category: formData.weight_category,
        session_id: formData.session_id,
        team_id: formData.team_id || null,
      };

      if (editingId) {
        await api.put(`/athletes/${editingId}`, submitData);
        toast.success('Athlete updated');
      } else {
        await api.post('/athletes', submitData);
        toast.success('Athlete registered successfully!');
      }
      resetForm();
      setShowForm(false);
      fetchAthletes();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error('Registration error:', error);
      toast.error(editingId ? `Failed to update athlete: ${errorMsg}` : `Failed to register athlete: ${errorMsg}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birth_date: '',
      gender: 'male',
      weight_category: '',
      session_id: '',
      team_id: '',
      id_number: '',
      registration_number: '',
      best_total: '',
      coach_name: '',
    });
    setEditingId(null);
  };

  const handleEdit = (athlete) => {
    setFormData(athlete);
    setEditingId(athlete.id);
    setShowForm(true);
  };

  // Get available weight classes based on selected session
  const getAvailableWeightClasses = () => {
    if (!formData.session_id) {
      // If no session selected, show all classes for current gender
      return formData.gender === 'female'
        ? ['48', '53', '58', '63', '69', '77', '86', '86+']
        : ['60', '65', '71', '79', '88', '94', '110', '110+'];
    }

    // Get the selected session
    const selectedSession = sessions.find(s => s.id === formData.session_id);
    
    if (!selectedSession) {
      return formData.gender === 'female'
        ? ['48', '53', '58', '63', '69', '77', '86', '86+']
        : ['60', '65', '71', '79', '88', '94', '110', '110+'];
    }

    // If session has weight_classes array, use those
    if (selectedSession.weight_classes && Array.isArray(selectedSession.weight_classes) && selectedSession.weight_classes.length > 0) {
      console.log('🔍 Session weight classes:', selectedSession.weight_classes);
      return selectedSession.weight_classes.sort();
    }

    // Fallback to session's weight_category
    return [selectedSession.weight_category];
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/athletes/${id}`);
        toast.success('Athlete deleted');
        fetchAthletes();
      } catch (error) {
        toast.error('Failed to delete athlete');
      }
    }
  };

  const filteredAthletes = athletes
    .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((a) => genderFilter === 'all' || a.gender === genderFilter);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Athletes</h1>
          <p className="text-slate-600 dark:text-zinc-400 font-ui">Register athletes • Body weight will be recorded during official weigh-in</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'Register Athlete'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card card-lg mb-8">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? 'Edit Athlete' : 'Register New Athlete'}
          </h2>

          {/* Alert if no sessions */}
          {!editingId && sessions.length === 0 && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm font-medium">
                ⚠️ No sessions available. Please create a session first before registering athletes.
              </p>
            </div>
          )}

          {/* Alert if no teams */}
          {!editingId && teams.length === 0 && (
            <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-800 dark:text-blue-300 text-sm font-medium">
                ℹ️ No teams registered yet. Athletes can be registered without a team.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name with Initials</label>
                <input
                  type="text"
                  placeholder="Name with Initials"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">DOB</label>
                <input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Weight Class</label>
                <select
                  value={formData.weight_category}
                  onChange={(e) => setFormData({ ...formData, weight_category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select Weight Class</option>
                  {getAvailableWeightClasses().map((wc) => (
                    <option key={wc} value={wc}>{wc}kg</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Session</label>
                <select
                  value={formData.session_id}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      session_id: e.target.value,
                      weight_category: '' // Reset weight category when session changes
                    });
                  }}
                  className="input"
                  required
                >
                  <option value="">Select Session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team</label>
                <select
                  value={formData.team_id || ''}
                  onChange={(e) => setFormData({ ...formData, team_id: e.target.value || null })}
                  className="input"
                >
                  <option value="">No Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">ID Number</label>
                <input
                  type="text"
                  placeholder="ID Number"
                  value={formData.id_number || ''}
                  onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration Number (Optional)</label>
                <input
                  type="text"
                  placeholder="Registration Number"
                  value={formData.registration_number || ''}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Best Total (kg)</label>
                <input
                  type="number"
                  placeholder="Best Total"
                  value={formData.best_total || ''}
                  onChange={(e) => setFormData({ ...formData, best_total: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coach Name</label>
                <input
                  type="text"
                  placeholder="Coach Name"
                  value={formData.coach_name || ''}
                  onChange={(e) => setFormData({ ...formData, coach_name: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                disabled={!editingId && sessions.length === 0}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update' : 'Register'} Athlete
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-4 text-gray-600" size={20} />
          <input
            type="text"
            placeholder="Search athletes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 py-3"
          />
        </div>
        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="input py-3"
        >
          <option value="all">All Categories</option>
          <option value="male">Men</option>
          <option value="female">Women</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading athletes...</p>
        </div>
      ) : filteredAthletes.length === 0 ? (
        <div className="card text-center py-16">
          <h3 className="font-heading text-2xl font-black text-black mb-2">No athletes found</h3>
          <p className="font-ui text-gray-600">Register athletes to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left p-4 font-heading font-black">Name</th>
                <th className="text-left p-4 font-heading font-black">Team</th>
                <th className="text-left p-4 font-heading font-black">Gender</th>
                <th className="text-left p-4 font-heading font-black">Weight Category</th>
                <th className="text-left p-4 font-heading font-black">Status</th>
                <th className="text-left p-4 font-heading font-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAthletes.map((athlete) => (
                <tr key={athlete.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-bold">{athlete.name}</td>
                  <td className="p-4">
                    {athlete.team ? (
                      <span className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 text-sm">
                        {athlete.team.name || athlete.team}
                      </span>
                    ) : (
                      <span className="text-slate-400">No Team</span>
                    )}
                  </td>
                  <td className="p-4 capitalize">{athlete.gender}</td>
                  <td className="p-4">{athlete.weight_category}kg</td>
                  <td className="p-4">
                    {athlete.weigh_in_completed_at ? (
                      <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
                        ✓ Weighed In
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium">
                        Pending Weigh-In
                      </span>
                    )}
                  </td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(athlete)}
                      className="p-2 hover:bg-blue-50 rounded border border-gray-200"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(athlete.id)}
                      className="p-2 hover:bg-red-50 rounded border border-gray-200"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
