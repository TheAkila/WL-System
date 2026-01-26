import { Plus, Calendar, Search, Edit2, Trash2, Activity, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Sessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [competition, setCompetition] = useState(null);
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    weight_category: '',
    gender: 'male',
    status: 'scheduled',
    current_lift: 'snatch',
    weight_classes: [], // Multi-class: selected weight classes
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCompetition();
    fetchSessions();
  }, []);

  const fetchCompetition = async () => {
    try {
      setCompetitionLoading(true);
      const response = await api.get('/competitions/current');
      setCompetition(response.data.data);
    } catch (error) {
      setCompetition(null);
    } finally {
      setCompetitionLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions');
      setSessions(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load sessions');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that at least one weight class is selected
    if (!formData.weight_classes || formData.weight_classes.length === 0) {
      toast.error('Please select at least one weight class');
      return;
    }
    
    try {
      setSubmitting(true);
      // Only send editable fields to backend
      const dataToSubmit = {
        name: formData.name,
        weight_category: formData.weight_classes[0], // Use first selected class as default
        gender: formData.gender,
        status: formData.status,
        current_lift: editingId ? formData.current_lift : 'snatch',
        weight_classes: formData.weight_classes,
      };
      
      console.log('📝 Submitting session form:', { isEdit: !!editingId, data: dataToSubmit });
      
      // Note: competition_id is now auto-assigned by backend
      if (editingId) {
        console.log('🔄 Updating session:', editingId);
        await api.put(`/sessions/${editingId}`, dataToSubmit);
        console.log('✅ Session updated successfully');
        toast.success('Session updated');
      } else {
        console.log('➕ Creating new session');
        await api.post('/sessions', dataToSubmit);
        console.log('✅ Session created successfully');
        toast.success(`Session created with ${dataToSubmit.weight_classes.length} weight class(es)`);
      }
      resetForm();
      setShowForm(false);
      fetchSessions();
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
      console.error('❌ Session error:', { statusCode: error.response?.status, error: errorMsg, fullError: error.response?.data });
      toast.error(errorMsg || (editingId ? 'Failed to update session' : 'Failed to create session'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      weight_category: '',
      gender: 'male',
      status: 'scheduled',
      current_lift: 'snatch',
      weight_classes: [],
    });
    setEditingId(null);
  };

  const handleEdit = (session) => {
    // Only extract editable fields to avoid sending system fields to backend
    setFormData({
      name: session.name,
      weight_category: session.weight_category,
      gender: session.gender,
      status: session.status,
      current_lift: session.current_lift,
      weight_classes: session.weight_classes && session.weight_classes.length > 0 
        ? session.weight_classes 
        : [session.weight_category],
    });
    setEditingId(session.id);
    setShowForm(true);
  };

  // Get available weight classes based on gender
  const getWeightClasses = () => {
    return formData.gender === 'female'
      ? ['48', '53', '58', '63', '69', '77', '86', '86+']
      : ['60', '65', '71', '79', '88', '94', '110', '110+'];
  };

  // Handle weight class checkbox change
  const handleWeightClassToggle = (weightClass) => {
    setFormData(prev => ({
      ...prev,
      weight_classes: prev.weight_classes.includes(weightClass)
        ? prev.weight_classes.filter(w => w !== weightClass)
        : [...prev.weight_classes, weightClass]
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await api.delete(`/sessions/${id}`);
        toast.success('Session deleted');
        fetchSessions();
      } catch (error) {
        toast.error('Failed to delete session');
      }
    }
  };

  const filteredSessions = sessions
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) => statusFilter === 'all' || s.status === statusFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Alert: No Competition */}
      {!competitionLoading && !competition && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg flex items-start gap-4">
          <AlertCircle size={24} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-amber-900 mb-1">No Competition Found</h3>
            <p className="text-sm text-amber-800 mb-3">
              You need to create a competition first before creating sessions.
            </p>
            <button
              onClick={() => navigate('/competitions')}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-semibold"
            >
              Create Competition
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Sessions</h1>
          <p className="text-slate-600 dark:text-zinc-400 font-ui">Manage competition sessions (each includes Snatch & Clean & Jerk)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="btn btn-primary"
        >
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'New Session'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card mb-8">
          <h2 className="font-heading text-2xl font-black text-black mb-2">
            {editingId ? 'Edit Session' : 'Create New Session'}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            💡 Each session automatically includes both Snatch and Clean & Jerk lifts
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Session Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              {editingId && (
                <select
                  value={formData.current_lift}
                  onChange={(e) => setFormData({ ...formData, current_lift: e.target.value })}
                  className="input"
                >
                  <option value="snatch">Currently: Snatch</option>
                  <option value="clean_and_jerk">Currently: Clean & Jerk</option>
                </select>
              )}
            </div>

            {/* Weight Classes Selection */}
            <div className="mt-6">
              <label className="block text-sm font-bold text-slate-800 dark:text-white mb-3">
                Weight Classes for This Session
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                {getWeightClasses().map(weightClass => (
                  <label key={weightClass} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={formData.weight_classes.includes(weightClass)}
                      onChange={() => handleWeightClassToggle(weightClass)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {weightClass}kg
                    </span>
                  </label>
                ))}
              </div>
              {formData.weight_classes.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Selected Classes: <span className="font-bold text-blue-600 dark:text-blue-400">{formData.weight_classes.join(', ')}kg</span> ({formData.weight_classes.length} class{formData.weight_classes.length !== 1 ? 'es' : ''})
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={submitting} className="btn btn-primary flex-1 disabled:opacity-50">
                {submitting ? 'Creating...' : editingId ? 'Update' : 'Create'} Session
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
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12 py-3"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input py-3"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="card text-center py-16">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="font-heading text-2xl font-black text-black mb-2">No sessions found</h3>
          <p className="font-ui text-gray-600">Create sessions to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-heading text-xl font-black text-black">{session.name}</h3>
                    <span className={`badge text-xs ${getStatusColor(session.status)}`}>
                      {session.status.replace('-', ' ').toUpperCase()}
                    </span>
                    {session.status === 'in-progress' && (
                      <span className="flex items-center gap-1 text-green-600">
                        <Activity size={14} />
                        <span className="text-xs font-bold">LIVE</span>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Weight Classes:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {session.weight_classes && session.weight_classes.length > 0 ? (
                          session.weight_classes.map(wc => (
                            <span key={wc} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs">
                              {wc}kg
                            </span>
                          ))
                        ) : (
                          <span className="font-bold text-gray-700">{session.weight_category}kg</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-bold ml-2 capitalize">{session.gender}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Lift:</span>
                      <span className="font-bold ml-2 capitalize">
                        {session.current_lift.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Lifts:</span>
                      <span className="font-bold ml-2 text-green-600">Snatch + C&J ✓</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(session)}
                    className="p-3 hover:bg-blue-50 rounded-lg border-2 border-gray-200"
                    title="Edit"
                  >
                    <Edit2 size={18} className="text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-3 hover:bg-red-50 rounded-lg border-2 border-gray-200"
                    title="Delete"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
