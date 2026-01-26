import { Plus, Users, Search, Edit2, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    manager_phone: '',
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    const filtered = teams.filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeams(filtered);
  }, [searchTerm, teams]);

  const fetchTeams = async () => {
    try {
      const response = await api.get('/teams');
      setTeams(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch teams');
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/teams/${editingId}`, formData);
        toast.success('Team updated successfully');
        setFormData({ name: '', country: '', manager_phone: '' });
        setShowForm(false);
        setEditingId(null);
        fetchTeams();
      } else {
        // Create new team
        const response = await api.post('/teams', formData);
        toast.success('Team created successfully! Now you can upload a logo.');
        
        // Switch to edit mode to allow logo upload
        const newTeamId = response.data.data.id;
        setEditingId(newTeamId);
        setFormData({
          name: response.data.data.name,
          country: response.data.data.country,
          manager_phone: response.data.data.manager_phone || '',
          logo_url: response.data.data.logo_url || '',
        });
        // Keep the form open so user can upload logo
        setShowForm(true);
        fetchTeams();
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (team) => {
    setEditingId(team.id);
    setFormData({
      name: team.name,
      country: team.country,
      manager_phone: team.manager_phone || '',
      logo_url: team.logo_url,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/teams/${id}`);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete team');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Teams</h1>
          <p className="text-slate-600 dark:text-zinc-400 font-ui">Manage teams and clubs</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', country: '', manager_phone: '' });
            setShowForm(!showForm);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>{showForm ? 'Cancel' : 'New Team'}</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card card-lg mb-8">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">
            {editingId ? 'Edit Team' : 'Create New Team'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="Team Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Team Code</label>
                <input
                  type="text"
                  placeholder="Team Code (3 letters, e.g., USA)"
                  required
                  maxLength="3"
                  minLength="3"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Manager Phone Number</label>
                <input
                  type="tel"
                  placeholder="Manager Phone Number"
                  value={formData.manager_phone || ''}
                  onChange={(e) => setFormData({ ...formData, manager_phone: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : editingId && !showForm ? 'Update Team' : editingId ? 'Save Changes' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', country: '', manager_phone: '' });
                  fetchTeams();
                }}
                className="btn btn-secondary"
              >
                {editingId ? 'Done' : 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <div className="card card-lg text-center py-12">
          <Users className="mx-auto text-slate-300 dark:text-zinc-600 mb-4" size={64} />
          <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            No teams found
          </h3>
          <p className="text-slate-600 dark:text-zinc-400 mb-6">
            {searchTerm ? 'Try adjusting your search' : 'Get started by creating a team'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mx-auto flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Create First Team</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTeams.map((team) => (
            <div key={team.id} className="card border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 flex flex-col">
              <div className="p-2 flex-1">
                <div className="mb-2">
                  <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white truncate">
                    {team.name}
                  </h3>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 p-2">
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleEdit(team)}
                    className="py-1 px-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-md font-medium text-xs transition-colors inline-flex items-center justify-center gap-0.5 flex-1"
                    title="Edit team"
                  >
                    <Edit2 size={12} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="py-1 px-1.5 bg-rose-50 dark:bg-zinc-800 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-zinc-700 rounded-md font-medium text-xs transition-colors inline-flex items-center justify-center gap-0.5 flex-1"
                    title="Delete team"
                  >
                    <Trash2 size={12} />
                    <span>Delete</span>
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
