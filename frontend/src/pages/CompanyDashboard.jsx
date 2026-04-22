import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase, PlusCircle, Users, TrendingUp, BarChart2,
  MapPin, IndianRupee, Clock, ChevronRight, Building,
  Download, Phone, Mail, Link2, User as UserIcon,
  UploadCloud, Globe, Calendar, CheckCircle, AlertTriangle
} from 'lucide-react';
import {
  getJobs, getInternships, createJobPosting, createInternshipPosting,
  getJobApplicants, getInternshipApplicants,
  getCompanyProfile, updateCompanyProfile, uploadCompanyLogo
} from '../api/jobs';
import client from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import MessageModal from '../components/MessageModal';

// ─────────────────────────────────────────
// COMPANY DASHBOARD
// ─────────────────────────────────────────
export function CompanyDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getJobs({ company_id: 'me', limit: 100 }),
      getInternships({ company_id: 'me', limit: 100 })
    ]).then(([j, i]) => {
      setJobs(j.data);
      setInternships(i.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const allPostings = [...jobs, ...internships];
  const totalApplicants = allPostings.reduce((sum, p) => sum + (p.applicant_count || 0), 0);
  const activePostings = allPostings.filter(p => p.is_active).length;
  const recentPostings = allPostings.slice(0, 3);

  const stats = [
    { label: 'Active Postings', value: activePostings, icon: Briefcase, color: 'blue' },
    { label: 'Total Postings', value: allPostings.length, icon: BarChart2, color: 'indigo' },
    { label: 'Total Applicants', value: totalApplicants, icon: Users, color: 'emerald' },
    { label: 'Hires Made', value: 0, icon: TrendingUp, color: 'amber' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back, {profile?.company_name || 'Company'} 👋
            </h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your postings.</p>
          </div>
          <Link to="/company/post" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm shrink-0">
            <PlusCircle className="h-5 w-5" /> Post New Job
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[s.color]}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-gray-900">{loading ? '—' : s.value}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Postings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Postings</h2>
            <Link to="/company/postings" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</Link>
          </div>
          {recentPostings.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No postings yet.</p>
              <Link to="/company/post" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Post your first job →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentPostings.map(p => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-gray-50 transition">
                  <div>
                    <span className="font-semibold text-gray-900">{p.title}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'ACTIVE' : 'CLOSED'}
                    </span>
                    <p className="text-sm text-gray-500 mt-0.5 capitalize">
                      {p.type} • {p.work_mode?.replace('_', ' ')} • {p.applicant_count} applicants
                    </p>
                  </div>
                  <Link to={`/company/postings/${p.id}/applicants`} className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition">
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// POST JOB PAGE (3-step wizard)
// ─────────────────────────────────────────
const PERKS_LIST = [
  'Certificate of Completion', 'Letter of Recommendation', 'Pre-Placement Offer (PPO)',
  'Flexible Work Hours', 'Free Meals / Snacks', 'Health Insurance',
  'Remote Work Option', 'Learning Budget', 'Stock Options'
];

export function PostJobPage() {
  const navigate = useNavigate();
  const addToast = useToast();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    type: 'job',
    title: '',
    work_mode: '',
    employment_type: 'full_time',
    openings: 1,
    stipend: '',
    deadline: '',
    duration: '',
    interview_start: '',
    availability_required: '',
    who_can_apply: '',
    description: '',
    additional_info: '',
    skills: [],
    perks: [],
    required_fields: [],
  });
  const [skillInput, setSkillInput] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      set('skills', [...form.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (s) => set('skills', form.skills.filter(x => x !== s));

  const togglePerk = (p) => {
    set('perks', form.perks.includes(p) ? form.perks.filter(x => x !== p) : [...form.perks, p]);
  };

  const toggleRequiredField = (f) => {
    set('required_fields', form.required_fields.includes(f)
      ? form.required_fields.filter(x => x !== f)
      : [...form.required_fields, f]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        stipend: form.stipend ? Number(form.stipend) : null,
        openings: Number(form.openings),
        deadline: new Date(form.deadline).toISOString(),
        interview_start: form.interview_start ? new Date(form.interview_start).toISOString() : null,
      };
      if (form.type === 'job') await createJobPosting(payload);
      else await createInternshipPosting(payload);
      addToast('Job posted successfully!', 'success');
      navigate('/company/postings');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to post job';
      addToast(typeof msg === 'string' ? msg : 'Duplicate posting for this role exists.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const chipClass = (active) =>
    `px-4 py-2 rounded-full border text-sm font-medium cursor-pointer transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Post a New Opportunity</h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition ${step >= n ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>{n}</div>
              {n < 3 && <div className={`h-1 w-12 rounded-full ${step > n ? 'bg-blue-600' : 'bg-gray-200'}`}></div>}
            </div>
          ))}
          <span className="ml-3 text-sm text-gray-500">
            {step === 1 ? 'Basic Info' : step === 2 ? 'Details & Description' : 'Skills & Perks'}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Opportunity Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => set('type', 'job')} className={`p-5 rounded-xl border-2 text-left transition ${form.type === 'job' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-2">💼</div>
                    <div className="font-bold text-gray-900">Full-time Job</div>
                    <div className="text-xs text-gray-500 mt-1">Permanent position</div>
                  </button>
                  <button onClick={() => set('type', 'internship')} className={`p-5 rounded-xl border-2 text-left transition ${form.type === 'internship' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-2">🎓</div>
                    <div className="font-bold text-gray-900">Internship</div>
                    <div className="text-xs text-gray-500 mt-1">Short-term program</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role Title</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Frontend Developer Intern" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Work Mode</label>
                <div className="flex gap-3 flex-wrap">
                  {['remote', 'hybrid', 'onsite'].map(m => (
                    <button key={m} onClick={() => set('work_mode', m)} className={chipClass(form.work_mode === m)}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Employment Type</label>
                <div className="flex gap-3">
                  {[['full_time', 'Full-time'], ['part_time', 'Part-time']].map(([val, label]) => (
                    <button key={val} onClick={() => set('employment_type', val)} className={chipClass(form.employment_type === val)}>{label}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Openings</label>
                <input type="number" min="1" value={form.openings} onChange={e => set('openings', e.target.value)} className="w-32 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.title || !form.work_mode}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
              >
                Next: Details →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stipend / Salary (₹/month)</label>
                  <input type="number" value={form.stipend} onChange={e => set('stipend', e.target.value)} placeholder="e.g. 25000" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Application Deadline *</label>
                  <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {form.type === 'internship' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                  <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3 months" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Required</label>
                  <select value={form.availability_required} onChange={e => set('availability_required', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any</option>
                    <option value="immediate">Immediate</option>
                    <option value="within_1_month">Within 1 Month</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Who can apply</label>
                  <select value={form.who_can_apply} onChange={e => set('who_can_apply', e.target.value)} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Any Experience</option>
                    <option value="Freshers only">Freshers Only</option>
                    <option value="1-2 years experience">1-2 Years Experience</option>
                    <option value="Any experience level">Any Experience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={6}
                  placeholder="Describe responsibilities, day-to-day work, what the candidate will learn..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length} chars (min 100)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Info (optional)</label>
                <textarea value={form.additional_info} onChange={e => set('additional_info', e.target.value)} rows={3} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.deadline || form.description.length < 10}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
                >
                  Next: Skills →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Skills Required</label>
                <div className="flex gap-3 mb-3">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Python..."
                    className="flex-grow border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button onClick={addSkill} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map(s => (
                    <span key={s} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSkill(s)} className="text-blue-600 hover:text-blue-900 ml-1 font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Perks & Benefits</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PERKS_LIST.map(p => (
                    <label key={p} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.perks.includes(p)}
                        onChange={() => togglePerk(p)}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Required applicant details */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Required Applicant Details
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Name, email, and resume are always collected. Select additional info you need from applicants:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'phone', label: '📞 Phone Number' },
                    { key: 'linkedin_url', label: '🔗 LinkedIn Profile' },
                    { key: 'availability', label: '📅 Availability' },
                    { key: 'is_fresher', label: '🎓 Experience Level' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-indigo-50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.required_fields.includes(key)}
                        onChange={() => toggleRequiredField(key)}
                        className="h-4 w-4 text-indigo-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition">← Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Posting...</>
                  ) : `Post ${form.type === 'job' ? 'Job' : 'Internship'} →`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MY POSTINGS PAGE
// ─────────────────────────────────────────
export function MyPostingsPage() {
  const [tab, setTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getJobs({ company_id: 'me', limit: 100 }),
      getInternships({ company_id: 'me', limit: 100 })
    ]).then(([j, i]) => {
      setJobs(j.data);
      setInternships(i.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const current = tab === 'jobs' ? jobs : internships;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Postings</h1>
          <Link to="/company/post" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm shadow-sm">
            <PlusCircle className="h-4 w-4" /> Post New
          </Link>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {[['jobs', 'Jobs'], ['internships', 'Internships']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition ${tab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {label} ({key === 'jobs' ? jobs.length : internships.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <div key={n} className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse" />)}
          </div>
        ) : current.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No {tab} posted yet.</p>
            <Link to="/company/post" className="text-blue-600 hover:underline text-sm mt-2 inline-block">Post one now →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {current.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {p.is_active ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 capitalize">
                      {p.work_mode?.replace('_', ' ')} • {p.employment_type?.replace('_', ' ') || p.duration} • {p.stipend ? `₹${p.stipend.toLocaleString()}/mo` : 'Unpaid'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Deadline: {new Date(p.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {p.openings} openings
                    </p>
                    {p.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.skills.map((s, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-extrabold text-gray-900">{p.applicant_count}</p>
                    <p className="text-xs text-gray-500">applicants</p>
                    <Link
                      to={`/company/postings/${p.id}/applicants`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      View <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// APPLICANTS PAGE
// ─────────────────────────────────────────
const STATUS_OPTIONS = ['under_review', 'shortlisted', 'rejected', 'hired'];
const STATUS_LABELS = { under_review: 'Under Review', shortlisted: 'Shortlisted', rejected: 'Rejected', hired: 'Hired' };
const STATUS_COLORS = {
  under_review: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  hired: 'bg-emerald-100 text-emerald-800',
};

export function ApplicantsPage() {
  const { id } = useParams();
  const addToast = useToast();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [msgTarget, setMsgTarget] = useState(null);

  useEffect(() => {
    // Load job info
    Promise.all([
      client.get(`/jobs/${id}`).catch(() => client.get(`/internships/${id}`)),
      client.get(`/jobs/${id}/applicants`).catch(() => client.get(`/internships/${id}/applicants`))
    ]).then(([jobRes, appRes]) => {
      setJob(jobRes.data);
      setApplicants(appRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await client.patch(`/jobs/applications/${appId}/status`, { status: newStatus });
      setApplicants(prev => prev.map(a =>
        a.application_id === appId ? { ...a, status: newStatus } : a
      ));
      addToast(`Status updated to ${STATUS_LABELS[newStatus]}`, 'success');
    } catch {
      addToast('Failed to update status.', 'error');
    }
  };

  const filtered = statusFilter === 'all' ? applicants : applicants.filter(a => a.status === statusFilter);

  if (loading) return <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center pt-20"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/company/postings" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 mb-4">
            ← Back to Postings
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{job?.title || 'Applicants'}</h1>
          <p className="text-gray-500 mt-1">{applicants.length} total applicants</p>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${statusFilter === s ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 text-gray-600 hover:border-gray-500'}`}
            >
              {s === 'all' ? 'All' : STATUS_LABELS[s]}
              <span className="ml-1.5 text-xs opacity-70">
                ({s === 'all' ? applicants.length : applicants.filter(a => a.status === s).length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">No applicants {statusFilter !== 'all' ? `with status "${STATUS_LABELS[statusFilter]}"` : 'yet'}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(ap => (
              <div key={ap.application_id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-start gap-5">
                  {ap.photo_url ? (
                    <img src={`http://localhost:8000${ap.photo_url}`} alt={ap.full_name} className="h-14 w-14 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                      {ap.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{ap.full_name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{ap.email}</span>
                          {ap.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{ap.phone}</span>}
                          {ap.linkedin_url && (
                            <a href={ap.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                          <Link2 className="h-3.5 w-3.5" /> LinkedIn
                            </a>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                          {ap.availability && <span className="bg-gray-100 px-2 py-0.5 rounded">Availability: {ap.availability.replace('_', ' ')}</span>}
                          <span className="bg-gray-100 px-2 py-0.5 rounded">{ap.is_fresher ? 'Fresher' : 'Experienced'}</span>
                          <span>Applied: {new Date(ap.applied_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-3 shrink-0">
                        <select
                          value={ap.status}
                          onChange={e => handleStatusChange(ap.application_id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-0 outline-none cursor-pointer ${STATUS_COLORS[ap.status]}`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>

                        <div className="flex gap-2">
                          {ap.resume_url && (
                            <a
                              href={`http://localhost:8000${ap.resume_url}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
                            >
                              <Download className="h-3.5 w-3.5" /> Resume
                            </a>
                          )}
                          <button
                            onClick={() => setMsgTarget(ap)}
                            className="flex items-center gap-1.5 text-sm text-blue-600 border border-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
                          >
                            💬 Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {msgTarget && job && (
        <MessageModal
          applicant={msgTarget}
          job={job}
          onClose={() => setMsgTarget(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// COMPANY PROFILE PAGE
// ─────────────────────────────────────────
export function CompanyProfilePage() {
  const { profile, setProfile } = useAuth();
  const addToast = useToast();
  const [form, setForm] = useState({ company_name: '', website: '', linkedin_url: '', founded_year: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name || '',
        website: profile.website || '',
        linkedin_url: profile.linkedin_url || '',
        founded_year: profile.founded_year || '',
      });
    }
  }, [profile]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadCompanyLogo(file);
      setProfile({ ...profile, logo_url: res.data.logo_url });
      addToast('Logo uploaded!', 'success');
    } catch {
      addToast('Failed to upload logo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateCompanyProfile({ ...form, founded_year: form.founded_year ? Number(form.founded_year) : null });
      setProfile(res.data);
      addToast('Profile saved!', 'success');
    } catch {
      addToast('Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Company Profile</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Logo section */}
          <div className="p-8 border-b border-gray-100 flex items-center gap-6">
            <div className="relative">
              {profile?.logo_url ? (
                <img src={`http://localhost:8000${profile.logo_url}`} alt="Logo" className="h-24 w-24 rounded-2xl object-cover border border-gray-200" />
              ) : (
                <div className="h-24 w-24 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-bold border border-emerald-200">
                  {profile?.company_name?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{profile?.company_name}</h2>
              <div className="mt-3 relative inline-block">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 w-full cursor-pointer" disabled={uploading} />
                <button className="flex items-center gap-2 text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  <UploadCloud className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Change Logo'}
                </button>
              </div>
            </div>
          </div>

          {/* Verification status banner */}
          {profile?.verified === true && (
            <div className="mx-8 mt-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-800">Your company is Verified ✓</p>
                <p className="text-sm text-emerald-700 mt-0.5">You can post jobs, manage applicants, and message seekers freely.</p>
              </div>
            </div>
          )}
          {profile?.verified === false && (
            <div className="mx-8 mt-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-amber-800">Verification Pending</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your account is under review. To get verified quickly, please fill in your <strong>Company Name</strong>, <strong>Website</strong>, and <strong>LinkedIn URL</strong> below and click Save. Our team reviews new companies within 24 hours.
                </p>
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ You cannot post jobs until your account is verified. If your company is flagged as suspicious, posting will be permanently blocked.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Globe className="inline h-4 w-4 mr-1" /> Website</label>
                <input type="url" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} placeholder="https://example.com" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"><Link2 className="inline h-4 w-4 mr-1" /> LinkedIn URL</label>
                <input type="url" value={form.linkedin_url} onChange={e => setForm(f => ({...f, linkedin_url: e.target.value}))} placeholder="https://linkedin.com/company/..." className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Calendar className="inline h-4 w-4 mr-1" /> Founded Year</label>
              <input type="number" value={form.founded_year} onChange={e => setForm(f => ({...f, founded_year: e.target.value}))} placeholder="e.g. 2018" className="w-40 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm disabled:opacity-70">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
