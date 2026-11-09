import React, { useState } from 'react';
import {
  Sun,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Clock,
  QrCode,
  Star,
  Users,
  Award,
  ChevronRight,
  Send,
  Building,
} from 'lucide-react';
import {
  FloatingCloud,
  FloatingSolarPanel,
  SolarHeroScene,
  EnergyParticle,
} from '../../components/animated/SolarDecorations';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const HomePage = ({ onNavigate }) => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleAction = (target) => {
    if (!user) {
      onNavigate('sign-in');
    } else {
      onNavigate(target);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    showToast("Thank you for your message! Our field desk team will contact you shortly.", "success");
  };

  return (
    <div className="relative overflow-hidden pt-20">
      
      {/* Background Ambient Cloud Animations */}
      <FloatingCloud speed="slow" top="12%" delay="0s" />
      <FloatingCloud speed="fast" top="28%" delay="6s" />
      <FloatingCloud speed="slow" top="65%" delay="12s" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="space-y-6 text-left relative z-20">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-300 text-solar-deepBlue text-xs font-bold shadow-sm">
              <Zap className="w-3.5 h-3.5 fill-solar-deepBlue text-solar-deepBlue" />
              <span>Smart Solar Field Service Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-solar-navy tracking-tight leading-[1.15]">
              Power Your Future with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-solar-deepBlue via-sky-500 to-emerald-500">
                Clean Solar Energy
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Smart Solar Installation and Maintenance Services at your fingertips. Coordinate with certified field technicians, receive itemized quotations, and track site progress in real time.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleAction(role === 'customer' ? 'customer-installation' : 'services')}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-base shadow-xl shadow-sky-500/25 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>Request Solar Installation</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleAction(role === 'customer' ? 'customer-maintenance' : 'services')}
                className="px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-solar-deepBlue border-2 border-sky-200 hover:border-sky-400 font-bold text-base shadow-sm transition-all hover:scale-105 flex items-center space-x-2"
              >
                <Wrench className="w-5 h-5 text-solar-sky" />
                <span>Book Maintenance</span>
              </button>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-sky-200/60 max-w-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Certified Techs</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Itemized Quotes</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700">UPI / Cash Pay</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Animated Hero Scene */}
          <div className="flex justify-center relative">
            <SolarHeroScene />
          </div>

        </div>
      </section>

      {/* ================= SERVICES SECTION ================= */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-solar-deepBlue text-xs font-bold">
            <span>Specialized Solar Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-solar-navy">
            Comprehensive Rooftop Solar Solutions
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From preliminary site feasibility assessments to turnkey PV mounting and efficiency tune-ups.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            
            {/* SERVICE CARD 1: INSTALLATION */}
            <div className="glass-panel rounded-3xl p-8 text-left glass-card-hover relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-sky-400/10 rounded-full blur-2xl group-hover:bg-sky-400/25 transition-all" />
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                  <Sun className="w-8 h-8 text-amber-300" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  On-Grid / Hybrid
                </span>
              </div>

              <h3 className="text-2xl font-bold text-solar-navy mb-3">Solar Panel Installation</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                High-efficiency mono-PERC and TOPCon solar arrays tailored for residential and commercial rooftops. Includes structure mounting, inverter setup, net metering support, and complete grid synchronisation.
              </p>

              <ul className="space-y-2 mb-8 text-sm text-slate-700 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Custom capacity from 1kW up to 50kW+</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Corrosion-resistant aluminium mounting frames</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Admin-verified itemized cost estimation</span>
                </li>
              </ul>

              <button
                onClick={() => handleAction('customer-installation')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm shadow-md shadow-sky-500/20 flex items-center justify-center space-x-2 transition-transform group-hover:translate-x-1"
              >
                <span>Request Solar Installation</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* SERVICE CARD 2: MAINTENANCE */}
            <div className="glass-panel rounded-3xl p-8 text-left glass-card-hover relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/25 transition-all" />
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
                  <Wrench className="w-8 h-8 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                  Health & Repair
                </span>
              </div>

              <h3 className="text-2xl font-bold text-solar-navy mb-3">Solar Panel Maintenance</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Keep your solar power generation at peak capacity. Certified technicians diagnose inverter faults, perform deep module cleaning, repair wiring hotspots, and test earthing connections.
              </p>

              <ul className="space-y-2 mb-8 text-sm text-slate-700 font-medium">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Module cleaning & dust hotspot elimination</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>DC string & microinverter error diagnostic</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  <span>Before & after work photo verification</span>
                </li>
              </ul>

              <button
                onClick={() => handleAction('customer-maintenance')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-transform group-hover:translate-x-1"
              >
                <span>Request Maintenance Service</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-sky-50/50 relative">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-solar-deepBlue text-xs font-bold">
            <span>Seamless Coordination</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-solar-navy">
            Our Service Workflow
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A transparent 6-stage lifecycle connecting Customers, Admins, and Field Technicians.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 pt-12 text-left">
            {[
              {
                step: "01",
                title: "Submit Request",
                desc: "Customer selects installation or maintenance with site address and capacity.",
                icon: Send,
              },
              {
                step: "02",
                title: "Receive Quote",
                desc: "Admin prepares itemized quotation with material, labour, and timeline.",
                icon: Clock,
              },
              {
                step: "03",
                title: "Approve Quote",
                desc: "Customer reviews and approves quotation to confirm service.",
                icon: CheckCircle2,
              },
              {
                step: "04",
                title: "Worker Assigned",
                desc: "Admin dispatches certified technician with scheduled date and time.",
                icon: Users,
              },
              {
                step: "05",
                title: "Work Execution",
                desc: "Technician arrives, updates live progress, and uploads before/after photos.",
                icon: Wrench,
              },
              {
                step: "06",
                title: "Verify & Pay",
                desc: "Scan Company UPI QR or pay cash. Admin verifies payment and closes ticket.",
                icon: QrCode,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-sky-100 flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-black text-sky-200 group-hover:text-solar-sky transition-colors">
                        {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-solar-deepBlue">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span>Enterprise Quality Standards</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-solar-navy leading-tight">
                Why Solar Panel Field Desk Stands Out
              </h2>
              <p className="text-slate-600 leading-relaxed">
                We bridge the gap between solar owners and certified field engineers. Every installation and maintenance service is backed by transparent quotations, verified technicians, photo proofing, and double-entry payment verification.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Certified Field Engineers</h4>
                  <p className="text-xs text-slate-500 mt-1">Background checked, skill-verified solar technicians.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                  <Award className="w-6 h-6 text-solar-deepBlue mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Zero Hidden Charges</h4>
                  <p className="text-xs text-slate-500 mt-1">Itemized transparent quotations prior to service confirmation.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                  <Zap className="w-6 h-6 text-amber-500 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Before & After Photo Proofs</h4>
                  <p className="text-xs text-slate-500 mt-1">Uploaded directly by technicians for Admin quality auditing.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-sm">
                  <QrCode className="w-6 h-6 text-sky-600 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">Company UPI QR & Cash</h4>
                  <p className="text-xs text-slate-500 mt-1">Direct company payment without worker personal QR risks.</p>
                </div>
              </div>
            </div>

            {/* Right Side Illustration */}
            <div className="flex justify-center">
              <FloatingSolarPanel className="transform scale-110" />
            </div>

          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-solar-navy">Customer Reviews</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Feedback from verified residential and commercial rooftop solar installations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            {[
              {
                name: "Anand Sharma",
                city: "Chennai (Velachery)",
                rating: 5,
                comment: "Excellent rooftop installation of 5kW system. Technician Ravi explained the inverter app and completed structural mounting on time.",
              },
              {
                name: "Meenakshi Sundaram",
                city: "Madurai",
                rating: 5,
                comment: "Quick maintenance visit! Our daily generation dropped by 4 units due to dust. The technician cleaned modules and fixed a loose DC cable connector.",
              },
              {
                name: "Karthik Subramanian",
                city: "Coimbatore",
                rating: 5,
                comment: "Transparent quotation system. No hidden costs. Scanned the company UPI QR directly on the website and got the verified receipt immediately.",
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 italic leading-relaxed">"{t.comment}"</p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4">
                  <p className="text-xs font-bold text-slate-800">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl shadow-xl text-left">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-bold text-solar-navy">Connect With Our Solar Field Desk</h3>
            <p className="text-xs text-slate-600">Have questions about rooftop feasibility or solar subsidies? Send us a message.</p>
          </div>

          {contactSubmitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-800">Inquiry Received!</h4>
              <p className="text-xs text-emerald-600">Our field coordinator will reach out to your phone within 2 business hours.</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98401 23456"
                    className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inquiry / Rooftop Requirement</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us your rooftop area, city, or problem description..."
                  className="w-full px-4 py-2.5 bg-white border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 text-sm flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <Send className="w-4 h-4" />
                <span>Send Inquiry to Field Desk</span>
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
};

