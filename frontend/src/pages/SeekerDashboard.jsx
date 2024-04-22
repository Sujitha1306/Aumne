import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMyApplications, uploadResume, updateProfile } from '../api/jobs';
import { Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle, UploadCloud, Link as LinkIcon, Edit2, FileText, ChevronRight } from 'lucide-react';

export function ProfilePage() {
  const { user, profile, setProfile } = useAuth();
  const [formData, setFormData] = useState({
    linkedin_url: '',
    availability: '',
    is_fresher: true
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        linkedin_url: profile.linkedin_url || '',
        availability: profile.availability || '',
        is_fresher: profile.is_fresher !== undefined ? profile.is_fresher : true
      });
    }
  }, [profile]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const res = await uploadResume(file);
      setProfile({ ...profile, resume_url: res.data.resume_url });
      setMessage({ type: 'success', text: 'Resume uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload resume.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(formData);
      setProfile(res.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const isComplete = profile?.resume_url;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Your Profile</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
            {message.text}
          </div>
        )}

        {!isComplete && (
          <div className="mb-8 bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
            <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-800">Complete your profile to apply</h3>
              <p className="text-amber-700 text-sm mt-1">You must upload a resume before you can apply to any jobs or internships.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-100 flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold border border-blue-200 shrink-0">
              {profile?.full_name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profile?.full_name}</h2>
              <p className="text-gray-500 mb-1">{user?.email}</p>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2.5 py-0.5 rounded-full font-medium ${isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {isComplete ? 'Profile Complete ✅' : 'Incomplete ❌'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" /> Resume Management
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center mb-10 bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
              <div className="flex-grow">
                {profile?.resume_url ? (
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"><FileText className="h-6 w-6 text-blue-600" /></div>
                    <div>
                      <p className="font-semibold text-gray-900">Current Resume</p>
                      <a href={`http://localhost:8000${profile.resume_url}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">View attached PDF <ExternalLinkIcon /></a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium">No resume uploaded.</p>
                )}
              </div>
              <div className="shrink-0 relative w-full sm:w-auto">
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileUpload} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm">
                  <UploadCloud className="h-4 w-4" /> {uploading ? 'Uploading...' : (profile?.resume_url ? 'Replace File' : 'Upload Resume')}
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Edit2 className="h-5 w-5 text-gray-400" /> Edit Details
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={e => setFormData({...formData, linkedin_url: e.target.value})}
                    placeholder="https://linkedin.com/in/..."
                    className="pl-10 w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Availability</label>
                  <select
                    value={formData.availability}
                    onChange={e => setFormData({...formData, availability: e.target.value})}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select availability</option>
                    <option value="immediate">Immediate</option>
                    <option value="within_1_month">Within 1 Month</option>
                    <option value="negotiable">Negotiable / Notice Period</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={formData.is_fresher ? "true" : "false"}
                    onChange={e => setFormData({...formData, is_fresher: e.target.value === "true"})}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="true">Fresher (0 years exp)</option>
                    <option value="false">Experienced</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-sm disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then(res => setApplications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'under_review': return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Under Review</span>;
      case 'shortlisted': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">Shortlisted</span>;
      case 'hired': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">Hired</span>;
      case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">My Applications</h1>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-4">
            <div className="h-6 w-full animate-pulse bg-gray-200 rounded"></div>
            <div className="h-6 w-full animate-pulse bg-gray-200 rounded"></div>
            <div className="h-6 w-full animate-pulse bg-gray-200 rounded"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">Start browsing to find your next opportunity.</p>
            <Link to="/jobs" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-sm inline-block">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase tracking-wider">Company</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase tracking-wider">Applied Date</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 font-semibold text-sm text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="font-bold text-gray-900">{app.job_title}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{app.company_name}</td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {new Date(app.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(app.status)}</td>
                      <td className="py-4 px-6">
                        <Link to={`/jobs/${app.job_id}`} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 inline-block transition">
                          <ChevronRight className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
}
