import React, { useState } from 'react';
import { applyForJob } from '../api/jobsApi';
import { Loader2 } from 'lucide-react';

const ApplyForm = ({ jobId, onApplySuccess }) => {
  const [applicantName, setApplicantName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | conflict | deadline | error
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicantName.trim()) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      await applyForJob(jobId, applicantName);
      setStatus('success');
      setApplicantName('');
      if (onApplySuccess) onApplySuccess();
      
      // Reset success state after a few seconds
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setStatus('conflict');
          setErrorMessage('Already applied to this job');
        } else if (error.response.status === 422) {
          setStatus('deadline');
          setErrorMessage('Application deadline has passed');
        } else {
          setStatus('error');
          setErrorMessage('Failed to apply. Please try again.');
        }
      } else {
        setStatus('error');
        setErrorMessage('Network error occurred.');
      }
    }
  };

  return (
    <div className="mt-6 border-t border-white/10 pt-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor={`applicant_name_${jobId}`} className="sr-only">Applicant Name</label>
        <div className="flex gap-2">
          <input
            id={`applicant_name_${jobId}`}
            type="text"
            className="bg-base border border-white/30 text-white px-3 py-2 text-sm focus:outline-none focus:border-primary flex-grow transition-colors"
            placeholder="ENTER YOUR NAME_"
            value={applicantName}
            onChange={(e) => setApplicantName(e.target.value)}
            disabled={status === 'loading'}
            required
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={status === 'loading' || !applicantName.trim()}
            className="brutal-btn brutal-btn-primary px-4 py-2 flex items-center justify-center min-w-[100px]"
          >
            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APPLY'}
          </button>
        </div>
        
        {/* State-Driven Feedback rendering */}
        <div className="min-h-[24px] text-xs font-mono uppercase tracking-wider">
          {status === 'success' && <div className="text-primary tracking-widest">&gt; Successfully applied! _</div>}
          {status === 'conflict' && <div className="text-error">&gt; {errorMessage}</div>}
          {status === 'deadline' && <div className="text-error">&gt; {errorMessage}</div>}
          {status === 'error' && <div className="text-error">&gt; {errorMessage}</div>}
        </div>
      </form>
    </div>
  );
};

export default ApplyForm;
