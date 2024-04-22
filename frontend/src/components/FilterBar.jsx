import { useState, useEffect } from 'react';
import { Search, MapPin, IndianRupee, X } from 'lucide-react';

export default function FilterBar({ onFilterChange }) {
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [minStipend, setMinStipend] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        search: search || null,
        work_mode: workMode || null,
        min_stipend: minStipend || null,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, workMode, minStipend]);

  const handleClear = () => {
    setSearch('');
    setWorkMode('');
    setMinStipend('');
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Role or Skills</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="e.g. React Developer"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Work Mode</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="pl-9 w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            >
              <option value="">Any Mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Stipend</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={minStipend}
              onChange={(e) => setMinStipend(e.target.value)}
              className="pl-9 w-full rounded-lg border-gray-300 border px-4 py-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
            >
              <option value="">Any Amount</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
              <option value="20000">₹20,000+</option>
              <option value="50000">₹50,000+</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-auto flex justify-end">
          <button
            onClick={handleClear}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium w-full md:w-auto"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
