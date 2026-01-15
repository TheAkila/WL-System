import { Plus, Trophy, Search } from 'lucide-react';

export default function Competitions() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-5xl font-black text-black mb-2">COMPETITIONS</h1>
          <p className="font-ui text-sm font-bold text-gray-600 uppercase tracking-widest">Manage your competitions</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          <span>New Competition</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="relative md:col-span-2">
          <Search className="absolute left-4 top-4 text-gray-600" size={20} />
          <input
            type="text"
            placeholder="Search competitions..."
            className="input pl-12 py-3"
          />
        </div>
        <select className="input py-3">
          <option>All Status</option>
          <option>Upcoming</option>
          <option>Ongoing</option>
          <option>Completed</option>
        </select>
      </div>

      {/* Content Card */}
      <div className="card">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="font-heading text-2xl font-black text-black mb-2">Competition Management</h3>
            <p className="font-ui text-gray-600 max-w-md">
              Create and manage weightlifting competitions with integrated athlete registration, session planning, and real-time result tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
