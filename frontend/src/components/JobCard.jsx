import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Clock, Users } from 'lucide-react';

export default function JobCard({ job }) {
  const isJob = job.type === 'job';
  const detailLink = isJob ? `/jobs/${job.id}` : `/internships/${job.id}`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-200 p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          {job.company_logo ? (
            <img src={`http://localhost:8000${job.company_logo}`} alt={job.company_name} className="h-12 w-12 rounded bg-gray-50 object-contain border border-gray-100" />
          ) : (
            <div className="h-12 w-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
              {job.company_name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{job.title}</h3>
            <p className="text-sm text-gray-600">{job.company_name}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${job.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {job.is_active ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-y-3 mb-4 flex-grow">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="capitalize">{job.work_mode?.replace('_', ' ') || 'Not specified'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <IndianRupee className="h-4 w-4 text-gray-400" />
          <span>{job.stipend ? `₹${job.stipend.toLocaleString()}/mo` : 'Unpaid'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="capitalize">{job.employment_type?.replace('_', ' ') || job.duration || 'Full Time'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{job.applicant_count} applicants</span>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {job.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">+{job.skills.length - 3}</span>
          )}
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <span className="text-xs text-gray-500">Posted {job.posted_ago}</span>
        <Link 
          to={detailLink} 
          className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
        >
          View Details <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
