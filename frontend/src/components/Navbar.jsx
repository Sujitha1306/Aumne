import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Building, LogOut, User as UserIcon, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnreadCount } from '../api/jobs';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = () => {
      getUnreadCount()
        .then(res => setUnreadCount(res.data.unread_count))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">JobPortal</span>
            </Link>

            {(!user || user?.role === 'seeker') && (
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link to="/" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Home</Link>
                <Link to="/jobs" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Jobs</Link>
                <Link to="/internships" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Internships</Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Login</Link>
                <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">Sign Up</Link>
              </>
            ) : user.role === 'seeker' ? (
              <>
                <Link to="/inbox" className="text-gray-500 hover:text-blue-600 p-2 relative">
                  <Mail className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link to="/my-applications" className="text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-2">My Applications</Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {profile?.photo_url ? (
                      <img src={`http://localhost:8000${profile.photo_url}`} alt="Avatar" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
                    ) : (
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/company/post" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition shadow-sm">Post Job</Link>
                <Link to="/company/postings" className="text-gray-600 hover:text-emerald-600 text-sm font-medium px-3 py-2">My Postings</Link>

                {/* Company message badge */}
                <Link to="/company/postings" className="text-gray-500 hover:text-emerald-600 p-2 relative" title="Messages from applicants">
                  <Mail className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {profile?.logo_url ? (
                      <img src={`http://localhost:8000${profile.logo_url}`} alt="Logo" className="h-8 w-8 rounded-full border border-gray-200 object-cover" />
                    ) : (
                      <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200">
                        <Building className="h-4 w-4 text-emerald-600" />
                      </div>
                    )}
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1">
                      <Link to="/company/dashboard" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                      <Link to="/company/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <Building className="h-4 w-4" /> Company Profile
                      </Link>
                      <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut className="h-4 w-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
