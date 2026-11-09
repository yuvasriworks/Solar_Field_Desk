import React, { useState } from 'react';
import { Sun, User, LogOut, Menu, X, Shield, Wrench, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ activeSection = 'home', onNavigate }) => {
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (target) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(target);
    }
  };

  const getDashboardTarget = () => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'worker') return 'worker-dashboard';
    return 'customer-dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-sky-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Brand */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sun className="w-7 h-7 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-solar-navy group-hover:text-solar-deepBlue transition-colors">
                Solar<span className="text-solar-sky">Desk</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Field Workforce System
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNav('home')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'home' ? 'text-solar-deepBlue' : 'text-slate-600 hover:text-solar-deepBlue'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('services')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'services' ? 'text-solar-deepBlue' : 'text-slate-600 hover:text-solar-deepBlue'
              }`}
            >
              Services
            </button>
            <button
              onClick={() => handleNav('how-it-works')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'how-it-works' ? 'text-solar-deepBlue' : 'text-slate-600 hover:text-solar-deepBlue'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('about')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'about' ? 'text-solar-deepBlue' : 'text-slate-600 hover:text-solar-deepBlue'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNav('contact')}
              className={`text-sm font-semibold transition-colors ${
                activeSection === 'contact' ? 'text-solar-deepBlue' : 'text-slate-600 hover:text-solar-deepBlue'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleNav(getDashboardTarget())}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-500/25 flex items-center space-x-2 transition-all hover:scale-[1.02]"
                >
                  {role === 'admin' && <Shield className="w-4 h-4" />}
                  {role === 'worker' && <Wrench className="w-4 h-4" />}
                  {role === 'customer' && <User className="w-4 h-4" />}
                  <span>{user.name || 'Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleNav('sign-in')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-solar-deepBlue hover:bg-sky-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('sign-up')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700 text-white text-sm font-semibold shadow-md shadow-sky-500/20 transition-all hover:scale-[1.02]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-sky-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-sky-100 bg-white/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => handleNav('home')}
            className="block w-full text-left py-2 font-medium text-slate-700 hover:text-solar-deepBlue"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('services')}
            className="block w-full text-left py-2 font-medium text-slate-700 hover:text-solar-deepBlue"
          >
            Services
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="block w-full text-left py-2 font-medium text-slate-700 hover:text-solar-deepBlue"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('about')}
            className="block w-full text-left py-2 font-medium text-slate-700 hover:text-solar-deepBlue"
          >
            About Us
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="block w-full text-left py-2 font-medium text-slate-700 hover:text-solar-deepBlue"
          >
            Contact
          </button>

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav(getDashboardTarget())}
                  className="w-full py-2.5 bg-solar-deepBlue text-white font-semibold rounded-xl text-center text-sm"
                >
                  Go to {role?.toUpperCase()} Dashboard
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2 text-rose-600 font-medium text-center text-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNav('sign-in')}
                  className="py-2.5 border border-sky-200 rounded-xl text-solar-deepBlue text-sm font-semibold text-center"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('sign-up')}
                  className="py-2.5 bg-solar-deepBlue text-white rounded-xl text-sm font-semibold text-center shadow-md shadow-sky-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
