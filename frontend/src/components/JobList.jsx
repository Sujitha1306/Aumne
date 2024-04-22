import React, { useState, useEffect } from 'react';
import { getJobs } from '../api/jobsApi';
import JobCard from './JobCard';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchJobs = async () => {
    try {
      const data = await getJobs();
      // Sort: newest deadline first, but put past deadlines at the end
      const now = new Date();
      const sortedJobs = data.sort((a, b) => {
        const da = new Date(a.deadline);
        const db = new Date(b.deadline);
        const aIsPast = da < now;
        const bIsPast = db < now;
        
        if (aIsPast && !bIsPast) return 1;
        if (!aIsPast && bIsPast) return -1;
        return da - db;
      });
      
      setJobs(sortedJobs);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError('Failed to construct network stream. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // 30-second polling interval for real-time updates
    const interval = setInterval(() => {
      fetchJobs();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-primary font-mono gap-4 uppercase tracking-widest text-sm">
        <RefreshCcw className="animate-spin w-8 h-8" />
        <p>Initializing uplink...</p>
      </div>
    );
  }

  return (
    <section aria-label="job list section" className="w-full">
      <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-4">
        <div>
          <h2 className="text-4xl font-bold uppercase tracking-tighter sm:text-6xl md:text-7xl">
            Open <span className="text-transparent" style={{ WebkitTextStroke: '1px var(--color-primary)' }}>Positions</span>
          </h2>
        </div>
        <div className="font-mono text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-2 mb-2 hidden md:flex">
          <RefreshCcw size={10} />
          Pulse: {lastUpdated.toLocaleTimeString()}
        </div>
      </div>

      {error && (
        <div className="bg-error/20 border border-error text-error p-4 mb-8 font-mono tracking-widest text-xs uppercase flex items-center gap-3">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
        {jobs.length > 0 ? (
          jobs.map((job) => {
            const isPastDeadline = new Date(job.deadline) < new Date();
            return (
              <JobCard 
                key={job.id} 
                job={job} 
                isPastDeadline={isPastDeadline} 
              />
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center p-20 border border-dashed border-white/20 font-mono tracking-widest text-sm uppercase text-white/50">
            No active positions available at this sector.
          </div>
        )}
      </div>
    </section>
  );
};

export default JobList;
