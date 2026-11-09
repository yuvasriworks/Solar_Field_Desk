import React, { useState } from 'react';
import { Sun, User, Mail, Phone, MapPin, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FloatingSolarPanel } from '../../components/animated/SolarDecorations';
import api from '../../api/client';

export const SignUpPage = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirm_password) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', {
        full_name: formData.full_name,
        email: formData.email.trim(),
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        password: formData.password,
      });

      login(res.data);
      showToast(`Welcome, ${res.data.name}! Your account has been registered.`, 'success');
      onNavigate('customer-dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your information.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-5 rounded-3xl overflow-hidden shadow-2xl border border-sky-100 bg-white">

        {/* Left Side: Brand Highlights */}
        <div className="md:col-span-2 bg-gradient-to-br from-solar-navy via-sky-950 to-solar-deepBlue p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Sun className="w-6 h-6 text-amber-300" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Solar<span className="text-solar-sky">Desk</span>
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Customer Registration</h2>
            <p className="text-xs text-sky-200 leading-relaxed">
              Create your customer account to submit installation & maintenance requests, approve transparent quotations, and monitor your rooftop solar progress.
            </p>
          </div>

          <div className="py-6 flex justify-center">
            <FloatingSolarPanel className="scale-90" />
          </div>

          <div className="space-y-2 text-xs text-sky-100 border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Free initial site evaluation quote</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Certified field technicians</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified digital UPI & cash payments</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-left space-y-1 mb-6">
            <h3 className="text-2xl font-extrabold text-solar-navy">Customer Sign Up</h3>
            <p className="text-xs text-slate-500">Enter your details to create a free account.</p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    placeholder="Anand Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="anand@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Address *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="Street / House No, Area"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Chennai"
                  className="w-full px-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="600042"
                  className="w-full px-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all text-xs flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Customer Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('sign-in')}
                className="font-bold text-solar-deepBlue hover:underline"
              >
                Sign In Here
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

