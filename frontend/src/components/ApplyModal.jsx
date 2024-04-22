import { X, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ApplyModal({ job, onClose, onConfirm, applying }) {
  const { profile } = useAuth();
  
  const hasResume = !!profile?.resume_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">Confirm Application</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Applying to</p>
            <p className="font-semibold text-gray-900 text-lg">{job.title}</p>
            <p className="text-gray-600">at {job.company_name}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
            <p className="font-medium text-blue-900 mb-3 text-sm">Applying with your saved profile:</p>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" /> Name: {profile?.full_name}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" /> Phone: {profile?.phone || 'Not provided'}
              </li>
              <li className="flex items-center gap-2">
                {hasResume ? (
                  <><CheckCircle className="h-4 w-4 text-blue-600" /> Resume uploaded</>
                ) : (
                  <><AlertTriangle className="h-4 w-4 text-red-500" /> <span className="text-red-700">Missing resume</span></>
                )}
              </li>
            </ul>
          </div>

          {!hasResume ? (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">You need to complete your profile by uploading a resume before you can apply to jobs.</p>
              <Link to="/profile" className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm">
                Go to Profile
              </Link>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                disabled={applying}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {applying ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    Applying...
                  </>
                ) : (
                  'Confirm Apply'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
