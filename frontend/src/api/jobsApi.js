import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getJobs = async () => {
  const response = await api.get('/jobs/');
  return response.data;
};

export const applyForJob = async (jobId, applicantName) => {
  const response = await api.post(`/jobs/${jobId}/apply`, {
    applicant_name: applicantName,
  });
  return response.data;
};
