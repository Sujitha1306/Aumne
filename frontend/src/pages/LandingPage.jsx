import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getJobs, getInternships } from '../api/jobs';
import JobCard from '../components/JobCard';

export default function LandingPage() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [featuredInternships, setFeaturedInternships] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getJobs({ limit: 3 }).then(res => setFeaturedJobs(res.data)).catch(() => {});
    getInternships({ limit: 3 }).then(res => setFeaturedInternships(res.data)).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/jobs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              Find Your <span className="text-blue-600">Dream Job</span> or Internship
            </h1>
            <p className="text-lg text-gray-600 mb-10">
              Join thousands of professionals and kickstart your career with the best opportunities from top companies worldwide.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-xl mx-auto mb-10 flex shadow-sm rounded-xl overflow-hidden border border-gray-300">
              <div className="relative flex-grow">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, keywords, or company..." 
                  className="w-full pl-12 pr-4 py-4 outline-none text-gray-900"
                />
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-4 transition">
                Search
              </button>
            </form>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/jobs" className="w-full sm:w-auto px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition shadow-sm">
                Browse Jobs &rarr;
              </Link>
              <Link to="/internships" className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition shadow-sm border-2 border-emerald-600">
                Browse Internships &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-blue-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-around items-center gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold mb-2">500+</div>
            <div className="text-blue-100 font-medium">Companies Hiring</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2">1000+</div>
            <div className="text-blue-100 font-medium">Live Opportunities</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2">250+</div>
            <div className="text-blue-100 font-medium">Successful Hires</div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Featured Jobs</h2>
            <Link to="/jobs" className="text-blue-600 font-medium hover:text-blue-700">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => <JobCard key={job.id} job={job} />)}
            {featuredJobs.length === 0 && <p className="text-gray-500 col-span-full">No active jobs found.</p>}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Latest Internships</h2>
            <Link to="/internships" className="text-blue-600 font-medium hover:text-blue-700">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredInternships.map(internship => <JobCard key={internship.id} job={internship} />)}
            {featuredInternships.length === 0 && <p className="text-gray-500 col-span-full">No active internships found.</p>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl font-bold tracking-tight">JobPortal</span>
          </div>
          <p className="text-gray-400 mb-6">Your next big opportunity starts here.</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <Link to="/" className="hover:text-white">About</Link>
            <Link to="/jobs" className="hover:text-white">Jobs</Link>
            <Link to="/internships" className="hover:text-white">Internships</Link>
          </div>
          <p className="mt-8 text-gray-500 text-sm">&copy; 2026 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
