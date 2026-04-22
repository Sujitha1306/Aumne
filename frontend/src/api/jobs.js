import client from './client';

// Jobs & Internships
export const getJobs = (params) => client.get('/jobs/', { params });
export const getJob = (id) => client.get(`/jobs/${id}`);
export const applyJob = (id) => client.post(`/jobs/${id}/apply`);

export const getInternships = (params) => client.get('/internships/', { params });
export const getInternship = (id) => client.get(`/internships/${id}`);
export const applyInternship = (id) => client.post(`/internships/${id}/apply`);

// Companies
export const getCompanyProfile = () => client.get('/companies/profile');
export const updateCompanyProfile = (data) => client.put('/companies/profile', data);
export const uploadCompanyLogo = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/companies/logo', form);
};
export const getCompanyPublic = (id) => client.get(`/companies/${id}`);
export const createJobPosting = (data) => client.post('/jobs/', data);
export const createInternshipPosting = (data) => client.post('/internships/', data);
export const getJobApplicants = (id) => client.get(`/jobs/${id}/applicants`);
export const getInternshipApplicants = (id) => client.get(`/internships/${id}/applicants`);

// Seekers
export const getMyApplications = () => client.get('/users/applications');
export const deleteApplication = (id) => client.delete(`/users/applications/${id}`);
export const getProfile = () => client.get('/users/profile');
export const updateProfile = (data) => client.put('/users/profile', data);
export const uploadResume = (file) => {
  const form = new FormData();
  form.append('file', file);
  return client.post('/users/resume', form);
};

// Messages
export const getInbox = () => client.get('/messages/inbox');
export const getCompanyInbox = () => client.get('/messages/company-inbox');
export const getUnreadCount = () => client.get('/messages/unread-count');
export const getMessageThread = (jobId, userId) => client.get(`/messages/thread/${jobId}/${userId}`);
export const sendMessage = (data) => client.post('/messages/', data);
