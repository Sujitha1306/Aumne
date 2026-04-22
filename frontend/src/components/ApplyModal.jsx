import { useState } from 'react';
import { X, CheckCircle, AlertTriangle, Edit2, Save, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../api/jobs';

const FIELD_LABELS = {
  phone: 'Phone Number',
  linkedin_url: 'LinkedIn Profile',
  availability: 'Availability',
  is_fresher: 'Experience Level',
};

export default function ApplyModal({ job, onClose, onConfirm, applying }) {
  const { profile, setProfile } = useAuth();

  // Local editable state — seeded from current profile
  const [form, setForm] = useState({
    phone: profile?.phone || '',
    linkedin_url: profile?.linkedin_url || '',
    availability: profile?.availability || '',
    is_fresher: profile?.is_fresher !== undefined ? profile.is_fresher : true,
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);

  const requiredFields = job?.required_fields || [];

  const hasResume = !!profile?.resume_url;

  // Derive effective profile (merges saved form into profile for validation)
  const effective = { ...profile, ...form };

  const fieldValues = {
    phone: effective.phone,
    linkedin_url: effective.linkedin_url,
    availability: effective.availability,
    is_fresher: effective.is_fresher !== undefined ? String(effective.is_fresher) : null,
  };

  const missingRequired = requiredFields.filter(f => !fieldValues[f]);
  const canSubmit = hasResume && missingRequired.length === 0;

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await updateProfile(form);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50 shrink-0">
          <h3 className="font-bold text-gray-900 text-lg">Confirm Application</h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-6 overflow-y-auto">

          {/* Job info */}
          <div className="mb-5">
            <p className="text-sm text-gray-500 mb-0.5">Applying to</p>
            <p className="font-semibold text-gray-900 text-lg leading-tight">{job.title}</p>
            <p className="text-gray-500 text-sm">at {job.company_name}</p>
          </div>

          {/* Always-shown fields (read-only) */}
          <div className="mb-4 space-y-2">
            <ProfileRow
              label="Name"
              value={profile?.full_name}
              required
            />
            <ProfileRow
              label="Resume"
              value={hasResume ? 'Uploaded ✓' : null}
              required
              missingText="Upload required"
            />
          </div>

          {/* Editable fields */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Edit2 className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-blue-900 text-sm">Review & update your details</p>
            </div>

            <div className="space-y-3">
              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone Number {requiredFields.includes('phone') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  className={inputClass}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  LinkedIn URL {requiredFields.includes('linkedin_url') && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={e => setForm(f => ({ ...f, linkedin_url: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className={inputClass}
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Availability {requiredFields.includes('availability') && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={form.availability}
                  onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Select availability</option>
                  <option value="immediate">Immediate</option>
                  <option value="within_1_month">Within 1 Month</option>
                  <option value="negotiable">Negotiable / Notice Period</option>
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Experience Level {requiredFields.includes('is_fresher') && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={form.is_fresher ? 'true' : 'false'}
                  onChange={e => setForm(f => ({ ...f, is_fresher: e.target.value === 'true' }))}
                  className={inputClass}
                >
                  <option value="true">Fresher (0 years exp)</option>
                  <option value="false">Experienced</option>
                </select>
              </div>
            </div>

            {/* Save button */}
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-60"
              >
                {saving ? <Loader className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              {saved && <span className="text-sm text-emerald-600 font-medium">✓ Saved!</span>}
              {saveError && <span className="text-sm text-red-600">{saveError}</span>}
            </div>
          </div>

          {/* Missing required field warnings */}
          {!hasResume && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              ⚠️ You must upload a resume before applying.{' '}
              <Link to="/profile" onClick={onClose} className="underline font-medium">Upload now →</Link>
            </div>
          )}

          {missingRequired.length > 0 && hasResume && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              ⚠️ This company requires: <strong>{missingRequired.map(f => FIELD_LABELS[f] || f).join(', ')}</strong>.
              Fill in the fields above and click <strong>Save Changes</strong>.
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 shrink-0">
          {canSubmit ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={applying}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {applying ? (
                  <><div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Applying...</>
                ) : '🚀 Confirm Apply'}
              </button>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              {!hasResume ? 'Upload a resume to apply.' : 'Fill in all required fields above, then save.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileRow({ label, value, required, missingText = 'Not provided' }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {value
        ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
        : <AlertTriangle className={`h-4 w-4 shrink-0 ${required ? 'text-red-500' : 'text-amber-400'}`} />
      }
      <span className="font-medium text-gray-700">{label}:</span>
      <span className={value ? 'text-gray-800' : (required ? 'text-red-600 font-semibold' : 'text-gray-400')}>
        {value || missingText}
      </span>
    </div>
  );
}
