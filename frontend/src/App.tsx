import { Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './api/auth';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import UploadDocumentPage from './pages/UploadDocumentPage';
import ProcessingPage from './pages/ProcessingPage';
import ConfirmExtractionPage from './pages/ConfirmExtractionPage';
import Layout from './components/Layout';

function App() {
  const user = authApi.getCurrentUser();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected routes */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadDocumentPage />} />
        <Route path="/processing/:documentId" element={<ProcessingPage />} />
        <Route path="/confirm/:documentId" element={<ConfirmExtractionPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
