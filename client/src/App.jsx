import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './hooks/useToast';

// Layouts
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DpdpCompliance from './pages/DpdpCompliance';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import ReportDetail from './pages/ReportDetail';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Loader component
const ScreenLoader = () => (
  <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950 transition-colors duration-200">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900/40"></div>
      <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 dark:border-t-primary-400 animate-spin"></div>
    </div>
    <span className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Loading Session...</span>
  </div>
);

// 1. Guard for Authenticated Pages
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <ScreenLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// 2. Guard to redirect already logged-in users away from auth pages (login/signup)
const AnonymousRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <ScreenLoader />;
  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// 3. Layout for Public pages (Navbar + Content + Footer)
const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 border-t border-slate-200/50 dark:border-dark-800/50 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-dark-950 transition-colors">
        © {new Date().getFullYear()} Aura Pronunciation AI. All rights reserved. Compliant with India's DPDP Act 2023.
      </footer>
    </div>
  );
};

// 4. Layout for Dashboard/App pages (Sidebar + Content Scrollable)
const DashboardLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 overflow-y-auto h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Section */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/compliance" element={<DpdpCompliance />} />
              </Route>

              {/* Guest Only Section (Login / Signup) */}
              <Route element={<AnonymousRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Authenticated Platform Section */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/reports/:id" element={<ReportDetail />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
