import { X, FileText, CheckCircle, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FIELD_LABELS = {
  phone: 'Phone Number',
  linkedin_url: 'LinkedIn Profile',
  availability: 'Availability',
  is_fresher: 'Experience Level',
};

export default function ApplyModal({ job, onClose, onConfirm, applying }) {
  const { profile } = useAuth();

  const hasResume = !!profile?.resume_url;
  const requiredFields = job?.required_fields || [];

  // Check which company-required fields are missing
  const fieldValues = {
    phone: profile?.phone,
    linkedin_url: profile?.linkedin_url,
    availability: profile?.availability,
    is_fresher: profile?.is_fresher !== undefined ? String(profile.is_fresher) : null,
  };

  const missingRequired = requiredFields.filter(f => !fieldValues[f]);
  const canSubmit = hasResume && missingRequired.length === 0;

  const getFieldDisplay = (key) => {
    switch (key) {
      case 'phone': return profile?.phone || null;
      case 'linkedin_url': return profile?.linkedin_url || null;
      case 'availability': return profile?.availability?.replace('_', ' ') || null;
      case 'is_fresher': return profile?.is_fresher !== undefined ? (profile.is_fresher ? 'Fresher' : 'Experienced') : null;
      default: return null;
    }
  };

  // All fields to display (always show Name + Resume, plus any company-required ones)
  const displayFields = [
    { key: 'full_name', label: 'Name', value: profile?.full_name, required: true },
    { key: 'resume', label: 'Resume', value: hasResume ? 'Uploaded ✓' : null, required: true },
    { key: 'phone', label: 'Phone', value: profile?.phone || null, required: requiredFields.includes('phone') },
    { key: 'linkedin_url', label: 'LinkedIn', value: profile?.linkedin_url || null, required: requiredFields.includes('linkedin_url') },
    { key: 'availability', label: 'Availability', value: profile?.availability?.replace(/_/g, ' ') || null, required: requiredFields.includes('availability') },
    { key: 'is_fresher', label: 'Experience', value: profile?.is_fresher !== undefined ? (profile.is_fresher ? 'Fresher' : 'Experienced') : null, required: requiredFields.includes('is_fresher') },
  ];

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
          <div className="mb-5">
            <p className="text-sm text-gray-500 mb-1">Applying to</p>
            <p className="font-semibold text-gray-900 text-lg">{job.title}</p>
            <p className="text-gray-600">at {job.company_name}</p>
          </div>

          {/* Profile summary */}
          <div className="bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
            <p className="font-medium text-blue-900 mb-3 text-sm">Applying with your saved profile:</p>
            <ul className="space-y-2 text-sm">
              {displayFields.map(({ key, label, value, required }) => (
                <li key={key} className="flex items-center gap-2">
                  {value ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${required ? 'text-red-500' : 'text-amber-400'}`} />
                  )}
                  <span className={value ? 'text-gray-800' : (required ? 'text-red-700' : 'text-gray-500')}>
                    <span className="font-medium">{label}:</span>{' '}
                    {value || (required ? <span className="font-semibold">Required — not provided</span> : 'Not provided')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Blocking messages */}
          {!hasResume && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              ⚠️ You must upload a resume before applying.
            </div>
          )}

          {missingRequired.length > 0 && hasResume && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              ⚠️ This company requires:{' '}
              <strong>{missingRequired.map(f => FIELD_LABELS[f] || f).join(', ')}</strong>.
              Please complete your profile first.
            </div>
          )}

          {!canSubmit ? (
            <Link
              to="/profile"
              className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
            >
              Go to Profile →
            </Link>
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
                ) : 'Confirm Apply'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
