import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import { ProfilePage, MyApplicationsPage } from './pages/SeekerDashboard';
import { InboxPage } from './pages/InboxPage';
import {
  CompanyDashboard,
  PostJobPage,
  MyPostingsPage,
  ApplicantsPage,
  CompanyProfilePage,
} from './pages/CompanyDashboard';

function ProtectedSeeker({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'seeker') return <Navigate to="/company/dashboard" />;
  return children;
}

function ProtectedCompany({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'company') return <Navigate to="/" />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/:id" element={<JobDetailPage />} />
            <Route path="/internships" element={<JobsPage isInternship={true} />} />
            <Route path="/internships/:id" element={<JobDetailPage />} />

            <Route path="/my-applications" element={<ProtectedSeeker><MyApplicationsPage /></ProtectedSeeker>} />
            <Route path="/profile" element={<ProtectedSeeker><ProfilePage /></ProtectedSeeker>} />
            <Route path="/inbox" element={<ProtectedSeeker><InboxPage /></ProtectedSeeker>} />

            <Route path="/company/dashboard" element={<ProtectedCompany><CompanyDashboard /></ProtectedCompany>} />
            <Route path="/company/post" element={<ProtectedCompany><PostJobPage /></ProtectedCompany>} />
            <Route path="/company/postings" element={<ProtectedCompany><MyPostingsPage /></ProtectedCompany>} />
            <Route path="/company/postings/:id/applicants" element={<ProtectedCompany><ApplicantsPage /></ProtectedCompany>} />
            <Route path="/company/profile" element={<ProtectedCompany><CompanyProfilePage /></ProtectedCompany>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
