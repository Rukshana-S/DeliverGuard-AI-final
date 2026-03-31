import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PolicyProvider } from './context/PolicyContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSetup from './pages/ProfileSetup';
import BankSetup from './pages/BankSetup';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Coverage from './pages/Coverage';
import LiveMonitoring from './pages/LiveMonitoring';
import Claims from './pages/Claims';
import ClaimStatus from './pages/ClaimStatus';
import PayoutPage from './pages/PayoutPage';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminClaims from './pages/AdminClaims';
import AdminPolicies from './pages/AdminPolicies';
import AdminUsers from './pages/AdminUsers';
import AdminPayouts from './pages/AdminPayouts';
import AdminDisruptions from './pages/AdminDisruptions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminTraffic from './pages/AdminTraffic';
import AdminLogs from './pages/AdminLogs';
import FraudDetection from './pages/FraudDetection';
import ClaimDetected from './pages/claim/ClaimDetected';
import ClaimAutoStatus from './pages/claim/ClaimAutoStatus';
import ClaimVerification from './pages/claim/ClaimVerification';
import ClaimApproval from './pages/claim/ClaimApproval';
import ClaimSuccess from './pages/claim/ClaimSuccess';
import UploadSalaryProof from './pages/UploadSalaryProof';
import InsurancePaymentHistory from './pages/InsurancePaymentHistory';
import LandingPage from './pages/LandingPage';

const AUTH_PATHS = ['/login', '/register', '/onboarding', '/setup/', '/'];

/* Removes dark class on auth pages; restores saved preference on app pages */
function ThemeGuard() {
  const { pathname } = useLocation();
  useEffect(() => {
    const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
    if (isAuth) {
      document.documentElement.classList.remove('dark');
    } else {
      const saved = localStorage.getItem('theme');
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, [pathname]);
  return null;
}

function AppLayout({ children, title }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">{children}</main>
      </div>
    </div>
  );
}

function ProtectedLayout({ children, title }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <AppLayout title={title}>{children}</AppLayout>;
}

function AdminRoute({ children, title }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <AppLayout title={title}>{children}</AppLayout>;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <LandingPage />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <>
      <ThemeGuard />
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        {/* Public */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Onboarding */}
        <Route path="/onboarding"    element={<Onboarding />} />
        <Route path="/setup/profile" element={<ProfileSetup />} />
        <Route path="/setup/bank"    element={<BankSetup />} />

        {/* Worker */}
        <Route path="/dashboard"       element={<ProtectedLayout title="Dashboard"><Dashboard /></ProtectedLayout>} />
        <Route path="/coverage"        element={<ProtectedLayout title="My Coverage"><Coverage /></ProtectedLayout>} />
        <Route path="/monitoring"      element={<ProtectedLayout title="Live Monitoring"><LiveMonitoring /></ProtectedLayout>} />
        <Route path="/claims"          element={<ProtectedLayout title="Claims & Payouts"><Claims /></ProtectedLayout>} />
        <Route path="/claims/:id"      element={<ProtectedLayout title="Claim Status"><ClaimStatus /></ProtectedLayout>} />
        <Route path="/payout/:claimId" element={<ProtectedLayout title="Payout"><PayoutPage /></ProtectedLayout>} />
        <Route path="/analytics"       element={<ProtectedLayout title="Risk Analytics"><Analytics /></ProtectedLayout>} />
        <Route path="/profile"         element={<ProtectedLayout title="Profile"><Profile /></ProtectedLayout>} />
        <Route path="/upload-salary-proof"       element={<ProtectedLayout title="Upload Salary Proof"><UploadSalaryProof /></ProtectedLayout>} />
        <Route path="/insurance-payment-history" element={<ProtectedLayout title="Payment History"><InsurancePaymentHistory /></ProtectedLayout>} />

        {/* Admin */}
        <Route path="/admin"               element={<AdminRoute title="Admin Dashboard"><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users"         element={<AdminRoute title="Worker Management"><AdminUsers /></AdminRoute>} />
        <Route path="/admin/claims"        element={<AdminRoute title="Manage Claims"><AdminClaims /></AdminRoute>} />
        <Route path="/admin/policies"      element={<AdminRoute title="Policy Management"><AdminPolicies /></AdminRoute>} />
        <Route path="/admin/payouts"       element={<AdminRoute title="Payout Control"><AdminPayouts /></AdminRoute>} />
        <Route path="/admin/disruptions"   element={<AdminRoute title="Disruption Monitoring"><AdminDisruptions /></AdminRoute>} />
        <Route path="/admin/analytics"     element={<AdminRoute title="Risk Analytics"><AdminAnalytics /></AdminRoute>} />
        <Route path="/admin/traffic"       element={<AdminRoute title="TN Traffic Monitor"><AdminTraffic /></AdminRoute>} />
        <Route path="/admin/fraud"         element={<AdminRoute title="Fraud Detection"><FraudDetection /></AdminRoute>} />
        <Route path="/admin/logs"          element={<AdminRoute title="System Logs"><AdminLogs /></AdminRoute>} />

        {/* Claim Workflow */}
        <Route path="/claim/detected"     element={<ProtectedLayout title="Disruption Detected"><ClaimDetected /></ProtectedLayout>} />
        <Route path="/claim/status"       element={<ProtectedLayout title="Auto-Claim Status"><ClaimAutoStatus /></ProtectedLayout>} />
        <Route path="/claim/verification" element={<ProtectedLayout title="Security Scan"><ClaimVerification /></ProtectedLayout>} />
        <Route path="/claim/approval"     element={<ProtectedLayout title="Claim Approval"><ClaimApproval /></ProtectedLayout>} />
        <Route path="/claim/success"      element={<ProtectedLayout title="Payout Success"><ClaimSuccess /></ProtectedLayout>} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <PolicyProvider>
          <AppRoutes />
        </PolicyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
