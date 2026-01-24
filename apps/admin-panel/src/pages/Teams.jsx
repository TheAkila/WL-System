import { Plus, Users, Search, Edit2, Trash2, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

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
        setFormData({ name: '', country: '' });
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
          logo_url: response.data.data.logo_url,
        });
        // Keep the form open so user can upload logo
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
            setFormData({ name: '', country: '' });
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
              <input
                type="text"
                placeholder="Team Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
              />
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
            
            {/* Logo Upload - show when editing or just created */}
            {editingId && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-700">
                <ImageUpload
                  currentImageUrl={formData.logo_url}
                  uploadEndpoint={`/uploads/teams/${editingId}/logo`}
                  onUploadSuccess={(data) => {
                    setFormData({ ...formData, logo_url: data.logoUrl });
                    toast.success('Logo uploaded successfully!');
                  }}
                  label="Team Logo"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Saving...' : editingId && !showForm ? 'Update Team' : editingId ? 'Save Changes' : 'Create Team'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: '', country: '' });
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
      <div className="card mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search teams by name or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-12"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div key={team.id} className="card hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Team Logo */}
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={team.name}
                      className="w-16 h-16 object-cover rounded-lg border-2 border-slate-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-16 h-16 p-2 bg-blue-600/20 text-blue-600 rounded-lg flex items-center justify-center">
                      <Users size={32} />
                    </div>
                  )}
                  
                  <div className="flex-1 ml-4">
                    <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                      <Globe size={16} />
                      <span className="font-medium">{team.country}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => handleEdit(team)}
                    className="flex-1 py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(team.id)}
                    className="flex-1 py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
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
