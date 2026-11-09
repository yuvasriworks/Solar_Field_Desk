import React, { useState } from 'react';
import { Sun, Mail, Lock, ArrowRight, Shield, Wrench, User, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FloatingSolarPanel, SunGlow } from '../../components/animated/SolarDecorations';
import api from '../../api/client';

export const SignInPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      login(res.data);
      showToast(`Welcome back, ${res.data.name}!`, 'success');

      if (res.data.role === 'admin') {
        onNavigate('admin-dashboard');
      } else if (res.data.role === 'worker') {
        onNavigate('worker-dashboard');
      } else {
        onNavigate('customer-dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@solar.com');
      setPassword('Admin@123');
    } else if (role === 'worker') {
      setEmail('ravi@solar.com');
      setPassword('Worker@123');
    } else if (role === 'customer') {
      setEmail('anand@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-sky-100 bg-white">
        
        {/* Left Side: Animated Brand Presentation */}
        <div className="bg-gradient-to-br from-solar-navy via-sky-900 to-solar-deepBlue p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Sun className="w-7 h-7 text-amber-300 animate-spin-slow" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Solar<span className="text-solar-sky">Desk</span>
              </span>
            </div>
            <h2 className="text-2xl font-bold leading-tight">
              A Role-Based Solar Service Management Desk
            </h2>
            <p className="text-xs text-sky-200 leading-relaxed">
              Unified field workforce coordination platform linking Customers, Field Technicians, and System Administrators.
            </p>
          </div>

          <div className="relative z-10 py-8 flex justify-center">
            <FloatingSolarPanel />
          </div>

          {/* Quick Preset Buttons for College Demo / Grading */}
          <div className="relative z-10 pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-solar-yellow" />
              <span>One-Click Demo Credentials:</span>
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium flex items-center justify-center space-x-1 transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-solar-sky" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('worker')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium flex items-center justify-center space-x-1 transition-colors"
              >
                <Wrench className="w-3.5 h-3.5 text-solar-yellow" />
                <span>Worker</span>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('customer')}
                className="py-1.5 px-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-medium flex items-center justify-center space-x-1 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-emerald-300" />
                <span>Customer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-left space-y-1 mb-8">
            <h3 className="text-2xl font-extrabold text-solar-navy">Sign In to Account</h3>
            <p className="text-xs text-slate-500">Access your role-specific service desk and live job tracking.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@solar.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New Customer?{' '}
              <button
                type="button"
                onClick={() => onNavigate('sign-up')}
                className="font-bold text-solar-deepBlue hover:underline"
              >
                Register Here
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

