import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { getJob, getInternship, applyJob, applyInternship, getMyApplications } from '../api/jobs';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, IndianRupee, Clock, Users, Building, ExternalLink, Calendar, Info, Lock } from 'lucide-react';
import ApplyModal from '../components/ApplyModal';

export default function JobDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isInternship = location.pathname.includes('/internships');
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = isInternship ? await getInternship(id) : await getJob(id);
        setJob(res.data);

        // Check if seeker has already applied
        if (user && user.role === 'seeker') {
          try {
            const appRes = await getMyApplications();
            const applied = appRes.data.some(a => a.job_id === parseInt(id));
            setAlreadyApplied(applied);
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, isInternship, user]);

  const handleApply = async () => {
    setApplying(true);
    setApplyMessage(null);
    try {
      if (isInternship) await applyInternship(job.id);
      else await applyJob(job.id);
      
      setApplyMessage({ type: 'success', text: '✅ Application submitted successfully!' });
      setAlreadyApplied(true); // immediately reflect the change
      setTimeout(() => setShowApplyModal(false), 2000);
    } catch (err) {
      setApplyMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to apply'
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center"><div className="animate-spin h-8 w-8 text-blue-600 border-4 border-t-transparent rounded-full"></div></div>;
  if (!job) return <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center font-bold text-xl text-gray-500">Not Found</div>;

  const deadlinePassed = new Date() > new Date(job.deadline);
  const canApply = job.is_active && !deadlinePassed;

  // If user is not logged in, show an auth-gate overlay
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2 mb-6 transition">
            &larr; Back to listings
          </button>

          {/* Blurred job preview */}
          <div className="relative">
            <div className="filter blur-sm pointer-events-none select-none">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-4">
                <div className="flex items-start gap-5 mb-6">
                  <div className="h-20 w-20 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-3xl">
                    {job.company_name.charAt(0)}
                  </div>
                  <div className="pt-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{job.title}</h1>
                    <p className="text-xl text-gray-600">{job.company_name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium">{job.work_mode?.replace('_', ' ') || 'Remote'}</span>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium">{job.employment_type?.replace('_', ' ') || 'Full Time'}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>

            {/* Auth gate overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 mx-4 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Sign in to view details</h2>
                <p className="text-gray-500 mb-6">
                  Create a free account or log in to view the full job description, requirements, and apply for this position.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/signup"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-center"
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 font-bold py-3 rounded-xl transition text-center"
                  >
                    Log In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 font-medium flex items-center gap-2 mb-6 transition">
          &larr; Back to listings
        </button>

        {applyMessage?.type === 'success' && (
          <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200">
            {applyMessage.text}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-start gap-5 mb-8">
                {job.company_logo ? (
                  <img src={`http://localhost:8000${job.company_logo}`} alt={job.company_name} className="h-20 w-20 rounded-xl object-contain border border-gray-100 bg-gray-50" />
                ) : (
                  <div className="h-20 w-20 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-3xl">
                    {job.company_name.charAt(0)}
                  </div>
                )}
                <div className="pt-1">
                  <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{job.title}</h1>
                  <p className="text-xl text-gray-600">{job.company_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-10">
                <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.work_mode?.replace('_', ' ') || 'Remote'}</span>
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {job.employment_type?.replace('_', ' ') || 'Full Time'}</span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 ${canApply ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {canApply ? 'OPEN' : 'CLOSED'}
                </span>
              </div>

              <div className="space-y-10">
                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">About the role</h3>
                  <div className="prose text-gray-600 max-w-none">
                    {job.description.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills?.length > 0 ? job.skills.map((s, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">{s}</span>
                    )) : <span className="text-gray-500">Not specified</span>}
                  </div>
                </section>

                {job.perks?.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Perks</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {job.perks.map((p, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600"><CheckCircle className="h-5 w-5 text-emerald-500" /> {p}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {job.who_can_apply && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Who can apply</h3>
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex gap-4">
                      <Info className="h-6 w-6 text-blue-500 flex-shrink-0" />
                      <p className="text-gray-700">{job.who_can_apply}</p>
                    </div>
                  </section>
                )}

                {job.additional_info && (
                  <section>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Additional Information</h3>
                    <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 flex gap-4">
                      <Info className="h-6 w-6 text-amber-500 flex-shrink-0" />
                      <div className="text-gray-700">
                        {job.additional_info.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="mb-6">
                {!user ? (
                  <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm text-center block">
                    Login to Apply
                  </button>
                ) : user.role === 'company' ? (
                  <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                    Companies cannot apply
                  </button>
                ) : alreadyApplied ? (
                  <div className="w-full bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-bold py-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                    ✅ Already Applied
                  </div>
                ) : !canApply ? (
                  <button disabled className="w-full bg-gray-200 text-gray-500 font-bold py-3.5 rounded-xl cursor-not-allowed border border-gray-300">
                    Applications Closed
                  </button>
                ) : (
                  <button onClick={() => setShowApplyModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm">
                    Apply Now
                  </button>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center"><IndianRupee className="h-5 w-5 text-gray-500" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Stipend / Salary</p>
                    <p className="font-semibold text-gray-900">{job.stipend ? `₹${job.stipend.toLocaleString()}` : 'Unpaid'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center"><Users className="h-5 w-5 text-gray-500" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Openings</p>
                    <p className="font-semibold text-gray-900">{job.openings}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center"><Calendar className="h-5 w-5 text-gray-500" /></div>
                  <div>
                    <p className="text-sm text-gray-500">Apply By</p>
                    <p className="font-semibold text-gray-900">{new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                
                {job.duration && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center"><Clock className="h-5 w-5 text-gray-500" /></div>
                    <div>
                      <p className="text-sm text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">{job.duration}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Building className="h-5 w-5 text-gray-400" /> About Company</h4>
                <p className="font-semibold text-gray-800 mb-3">{job.company_name}</p>
                <div className="flex flex-col gap-2">
                  {job.company_website ? (
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1.5 hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View Full Profile
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No website provided</span>
                  )}
                  {job.company_linkedin_url && (
                    <a
                      href={job.company_linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800 text-sm font-medium flex items-center gap-1.5 hover:underline"
                    >
                      <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      LinkedIn Page
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal 
          job={job} 
          onClose={() => {setShowApplyModal(false); setApplyMessage(null);}} 
          onConfirm={handleApply}
          applying={applying} 
        />
      )}
      
      {/* Required for Perks checkmark since lucide requires explicit imports in ApplyModal usually, but to prevent error let's use it dynamically or import above */}
    </div>
  );
}

// Simple internal check circle component since we didn't import it globally
function CheckCircle(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
