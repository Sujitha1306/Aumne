import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Building, User as UserIcon } from 'lucide-react';
import { login, signup } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState(null); // 'seeker' or 'company'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login({ email, password });
      const returnedRole = res.data.role;

      // Role mismatch guard
      if (returnedRole !== selectedRole) {
        const roleLabel = returnedRole === 'company' ? 'Company' : 'Job Seeker';
        setError(`This account is registered as a ${roleLabel}. Please select the correct account type.`);
        setLoading(false);
        return;
      }

      await loginUser(res.data.access_token, { email, role: returnedRole });
      if (returnedRole === 'seeker') navigate('/jobs');
      else navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — Role selection
  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
          <Link to="/" className="inline-block mb-6">
            <Briefcase className="h-12 w-12 text-blue-600 mx-auto" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Sign in to JobPortal</h2>
          <p className="text-gray-500 mb-8">Choose your account type to continue</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedRole('seeker')}
              className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Job Seeker</h3>
              <p className="text-gray-500 text-sm">Browse jobs, track applications, and get hired.</p>
            </button>

            <button
              onClick={() => setSelectedRole('company')}
              className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition">
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Company</h3>
              <p className="text-gray-500 text-sm">Post jobs, manage applicants, and hire top talent.</p>
            </button>
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up here</Link>
          </div>
        </div>
      </div>
    );
  }

  const isCompany = selectedRole === 'company';
  const accent = isCompany ? 'emerald' : 'blue';

  // Step 2 — Login form
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <Briefcase className={`h-10 w-10 text-${accent}-600`} />
          <span className="text-3xl font-bold text-gray-900 tracking-tight">JobPortal</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Sign in as {isCompany ? 'Company' : 'Job Seeker'}
        </h2>
        <button onClick={() => { setSelectedRole(null); setError(''); }} className="block mx-auto mt-2 text-sm text-blue-600 hover:underline">
          ← Change account type
        </button>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-${accent}-500 focus:border-${accent}-500 sm:text-sm`}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className={`w-full flex justify-center py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-${accent}-600 hover:bg-${accent}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${accent}-500 disabled:opacity-70`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">Sign up here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SignupPage() {
  const [role, setRole] = useState(null); // 'seeker' or 'company'
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', company_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { email: formData.email, password: formData.password, role };
      if (role === 'seeker') payload.full_name = formData.full_name;
      else payload.company_name = formData.company_name;

      const res = await signup(payload);
      await loginUser(res.data.access_token, { email: formData.email, role: res.data.role });
      
      if (res.data.role === 'seeker') navigate('/profile');
      else navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
          <Link to="/" className="inline-block mb-6">
            <Briefcase className="h-12 w-12 text-blue-600 mx-auto" />
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Join JobPortal Today</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => setRole('seeker')}
              className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-blue-500 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition">
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Job Seeker</h3>
              <p className="text-gray-500 text-sm">Find your dream job, upload your resume, and apply with one click.</p>
            </button>
            
            <button 
              onClick={() => setRole('company')}
              className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-emerald-500 shadow-sm hover:shadow-md transition text-center group"
            >
              <div className="bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition">
                <Building className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">I'm a Company</h3>
              <p className="text-gray-500 text-sm">Post verified jobs, manage applicants, and hire the best talent.</p>
            </button>
          </div>
          <div className="mt-8 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
          Create {role === 'seeker' ? 'Seeker' : 'Company'} Account
        </h2>
        <button onClick={() => setRole(null)} className="block mx-auto mt-2 text-sm text-blue-600 hover:underline">
          &larr; Change account type
        </button>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
            
            {role === 'seeker' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="mt-1">
                  <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <div className="mt-1">
                  <input type="text" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:text-sm ${role === 'seeker' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}`} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1">
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={`appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 sm:text-sm ${role === 'seeker' ? 'focus:ring-blue-500 focus:border-blue-500' : 'focus:ring-emerald-500 focus:border-emerald-500'}`} />
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full flex justify-center py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 ${role === 'seeker' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}>
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
