import { Edit2, Save, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ImageUpload from '../components/ImageUpload';

export default function Competitions() {
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    organizer: '',
    description: '',
    status: 'active',
  });

  useEffect(() => {
    fetchCompetition();
  }, []);

  const fetchCompetition = async () => {
    try {
      setLoading(true);
      const response = await api.get('/competitions/current');
      const data = response.data?.data;
      
      if (data) {
        setCompetition(data);
        // Format date for the date input (YYYY-MM-DD)
        const formattedDate = data.date ? new Date(data.date).toISOString().split('T')[0] : '';
        setFormData({
          name: data.name || '',
          date: formattedDate,
          location: data.location || '',
          organizer: data.organizer || '',
          description: data.description || '',
          status: data.status || 'active',
        });
      } else {
        // No competition exists, enable editing mode to create one
        setEditing(true);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Failed to fetch competition:', errorMsg);
      toast.error(`Failed to load competition: ${errorMsg}`);
      setEditing(true); // Allow creation if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.name || !formData.date || !formData.location) {
        toast.error('Please fill in all required fields');
        return;
      }

      const submitData = {
        name: formData.name,
        date: formData.date,
        location: formData.location,
        organizer: formData.organizer,
        description: formData.description,
        status: formData.status,
      };

      if (competition) {
        // Update existing competition
        await api.put('/competitions/current', submitData);
        toast.success('Competition updated successfully!');
      } else {
        // Initialize new competition
        try {
          await api.post('/competitions/initialize', submitData);
          toast.success('Competition created successfully!');
        } catch (error) {
          const errorMsg = error.response?.data?.message || error.message;
          
          // If competition already exists, fetch it and inform user
          if (error.response?.status === 409 || errorMsg.includes('already exists')) {
            toast.error('A competition already exists. Loading it now...');
            setTimeout(() => fetchCompetition(), 1500);
            return;
          }
          throw error;
        }
      }
      
      setEditing(false);
      await fetchCompetition();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(competition ? `Failed to update: ${errorMsg}` : `Failed to create: ${errorMsg}`);
      console.error('Submit error:', error);
    }
  };

  const handleCancel = () => {
    if (competition) {
      // Reset to original data
      const formattedDate = competition.date ? new Date(competition.date).toISOString().split('T')[0] : '';
      setFormData({
        name: competition.name || '',
        date: formattedDate,
        location: competition.location || '',
        organizer: competition.organizer || '',
        description: competition.description || '',
        status: competition.status || 'active',
      });
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!competition) return;
    
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this competition? This will also delete all associated sessions, athletes, and attempts. This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    try {
      await api.delete(`/competitions/${competition.id}`);
      toast.success('Competition deleted successfully');
      setCompetition(null);
      setEditing(true);
      setFormData({
        name: '',
        date: '',
        location: '',
        organizer: '',
        description: '',
        status: 'active',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Failed to delete competition: ${errorMsg}`);
      console.error('Delete error:', error);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">Competition Settings</h1>
          <p className="text-slate-600 dark:text-zinc-400 font-ui">Manage your competition information</p>
        </div>
        {!editing && competition && (
          <div className="flex gap-3">
            <button
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              Edit Competition
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Competition
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="card text-center py-12">
          <p className="text-slate-600 dark:text-zinc-400">Loading competition...</p>
        </div>
      ) : editing ? (
        /* Edit Form */
        <>
          {!competition && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <span className="font-semibold">Note:</span> You can only have one active competition at a time. 
                {/* If a competition exists, you can edit it below or delete it to create a new one. */}
              </p>
            </div>
          )}
          <div className="card card-lg">
          <h2 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-6">
            {competition ? 'Edit Competition' : 'Create Competition'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Competition Name *
                </label>
                <input
                  type="text"
                  placeholder="Competition Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                  Organizer
                </label>
                <input
                  type="text"
                  placeholder="Organizer"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn btn-primary flex-1">
                {competition ? 'Save Changes' : 'Create Competition'}
              </button>
              {competition && (
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
          </div>
        </>
      ) : (
        /* Display View */
        <div className="card card-lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">
                {competition.name}
              </h2>
              <span
                className={`badge text-xs mt-2 ${
                  competition.status === 'active'
                    ? 'badge-success'
                    : competition.status === 'upcoming'
                    ? 'badge-info'
                    : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300'
                }`}
              >
                {competition.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-slate-600 dark:text-zinc-400">
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-500">Date</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {new Date(competition.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="text-slate-600 dark:text-zinc-400">
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-500">Location</p>
              <p className="font-medium text-slate-900 dark:text-white">{competition.location}</p>
            </div>

            {competition.organizer && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-700">
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-500 mb-1">Organizer</p>
                <p className="font-medium text-slate-900 dark:text-white">{competition.organizer}</p>
              </div>
            )}

            {competition.description && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-700">
                <p className="text-sm font-medium text-slate-500 dark:text-zinc-500 mb-1">Description</p>
                <p className="text-slate-600 dark:text-zinc-400">{competition.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
