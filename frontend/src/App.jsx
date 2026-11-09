import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/public/HomePage';
import { SignInPage } from './pages/public/SignInPage';
import { SignUpPage } from './pages/public/SignUpPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const AppContent = () => {
  const { user, role } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [customerInitView, setCustomerInitView] = useState('overview');

  const navigate = (page) => {
    if (page === 'customer-installation') {
      setCustomerInitView('book');
      setCurrentPage('customer-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (page === 'customer-maintenance') {
      setCustomerInitView('book');
      setCurrentPage('customer-dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page === 'services' || page === 'how-it-works' || page === 'about' || page === 'contact') {
      setCurrentPage('home');
      setTimeout(() => {
        const el = document.getElementById(page);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'sign-in':
        return <SignInPage onNavigate={navigate} />;
      case 'sign-up':
        return <SignUpPage onNavigate={navigate} />;
      case 'customer-dashboard':
        return <CustomerDashboard initialView={customerInitView} onNavigate={navigate} />;
      case 'worker-dashboard':
        return <WorkerDashboard onNavigate={navigate} />;
      case 'admin-dashboard':
        return <AdminDashboard onNavigate={navigate} />;
      case 'home':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  const isDashboard = ['customer-dashboard', 'worker-dashboard', 'admin-dashboard'].includes(currentPage);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-sky-50 via-sky-100/50 to-cyan-50">
      <Navbar activeSection={currentPage} onNavigate={navigate} />
      <main className="flex-grow">
        {renderCurrentPage()}
      </main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
