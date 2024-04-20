-- Test company (password: company123)
INSERT INTO users (email, password_hash, role) VALUES 
  ('techcorp@test.com', '$2b$12$R.S4w6g9qSg6pQsT9G.HlO/Q7lR9fA0oHlY5cW9K5Y1aL7Z/4N9mS', 'company');
INSERT INTO companies (user_id, company_name, website, linkedin_url, verified, founded_year) VALUES
  (1, 'TechCorp Solutions', 'https://techcorp.com', 'https://linkedin.com/company/techcorp', 1, 2018);

-- Test seeker (password: user123)
INSERT INTO users (email, password_hash, role) VALUES 
  ('alice@test.com', '$2b$12$k2L1T9k5aS2lQsF9L.R9lO/Q7lR9fA0oHlY5cW9K5Y1aL7Z/4N9mC', 'seeker');
INSERT INTO user_profiles (user_id, full_name, phone, availability, is_fresher) VALUES
  (2, 'Alice Johnson', '9876543210', 'immediate', 1);

-- Active job posting
INSERT INTO jobs (company_id, title, type, work_mode, employment_type, stipend, deadline, openings, description, who_can_apply, is_active) VALUES
  (1, 'Frontend Developer', 'job', 'remote', 'full_time', 50000, '2026-12-31 23:59:59', 3, 
   'Build React applications for our SaaS platform.', 'Freshers welcome', 1);
INSERT INTO job_skills (job_id, skill_name) VALUES (1,'React'),(1,'JavaScript'),(1,'CSS');
INSERT INTO job_perks (job_id, perk_name) VALUES (1,'Health Insurance'),(1,'Remote Work'),(1,'Learning Budget');

-- Active internship
INSERT INTO jobs (company_id, title, type, work_mode, employment_type, stipend, deadline, openings, description, who_can_apply, duration, is_active) VALUES
  (1, 'Backend Intern', 'internship', 'hybrid', 'part_time', 15000, '2026-11-30 23:59:59', 2,
   'Work on Python FastAPI backend services.', 'CSE students preferred', '3 months', 1);
INSERT INTO job_skills (job_id, skill_name) VALUES (2,'Python'),(2,'FastAPI'),(2,'SQLite');

-- Expired posting (for deadline test)
INSERT INTO jobs (company_id, title, type, work_mode, stipend, deadline, openings, description, is_active) VALUES
  (1, 'DevOps Engineer', 'job', 'onsite', 40000, '2025-01-01 00:00:00', 1, 'Past deadline job.', 1);
