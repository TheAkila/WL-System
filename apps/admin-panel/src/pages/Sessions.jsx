import { Plus, Calendar, Search } from 'lucide-react';

export default function Sessions() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-5xl font-black text-black mb-2">SESSIONS</h1>
          <p className="font-ui text-sm font-bold text-gray-600 uppercase tracking-widest">Manage competition sessions</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          <span>New Session</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-4 text-gray-600" size={20} />
          <input
            type="text"
            placeholder="Search sessions..."
            className="input pl-12 py-3"
          />
        </div>
        <select className="input py-3">
          <option>All Status</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Scheduled</option>
        </select>
      </div>

      {/* Content Card */}
      <div className="card">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="font-heading text-2xl font-black text-black mb-2">Session Management</h3>
            <p className="font-ui text-gray-600 max-w-md">
              Comprehensive session management interface with real-time status updates, athlete tracking, and competition scheduling features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
