import React, { useState, useEffect } from 'react';
import {
  Sun,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  QrCode,
  DollarSign,
  Plus,
  Send,
  User,
  Star,
  MapPin,
  Calendar,
  FileText,
  Phone,
  Shield,
  X,
  Upload,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CompanyUPIQRCode } from '../../components/common/CompanyUPIQRCode';

export const CustomerDashboard = ({ initialView = 'overview' }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialView);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected item modals
  const [activeQRModal, setActiveQRModal] = useState(null);
  const [feedbackModalRequest, setFeedbackModalRequest] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [rejectQuoteModal, setRejectQuoteModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Booking Form State
  const [bookingType, setBookingType] = useState('installation');
  const [formData, setFormData] = useState({
    property_type: 'Residential Rooftop',
    capacity_kw: 5.0,
    problem_category: 'Low Power Output',
    problem_description: '',
    service_address: '',
    city: '',
    pincode: '',
    preferred_date: '',
  });
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes] = await Promise.all([
        api.get('/customer/dashboard-stats'),
        api.get('/customer/requests'),
      ]);
      setStats(statsRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      showToast("Failed to load customer records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBooking(true);

    try {
      await api.post('/customer/requests', {
        service_type: bookingType,
        property_type: formData.property_type,
        capacity_kw: bookingType === 'installation' ? parseFloat(formData.capacity_kw) : null,
        problem_category: bookingType === 'maintenance' ? formData.problem_category : null,
        problem_description: formData.problem_description,
        service_address: formData.service_address,
        city: formData.city,
        pincode: formData.pincode,
        preferred_date: formData.preferred_date,
      });

      showToast(`Solar ${bookingType} request submitted successfully!`, 'success');
      setFormData({
        property_type: 'Residential Rooftop',
        capacity_kw: 5.0,
        problem_category: 'Low Power Output',
        problem_description: '',
        service_address: '',
        city: '',
        pincode: '',
        preferred_date: '',
      });
      setActiveTab('requests');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to submit request.", "error");
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleQuotationDecision = async (quoteId, approved, reason = '') => {
    try {
      await api.post(`/customer/quotations/${quoteId}/respond`, {
        approved,
        rejection_reason: reason,
      });
      showToast(approved ? "Quotation approved! Admin will assign worker." : "Quotation rejected / revision sent.", "success");
      setRejectQuoteModal(null);
      fetchData();
    } catch (err) {
      showToast("Failed to respond to quotation.", "error");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customer/feedback', {
        request_id: feedbackModalRequest.id,
        rating: feedbackRating,
        comments: feedbackComment,
      });
      showToast("Thank you! Your feedback has been recorded.", "success");
      setFeedbackModalRequest(null);
      setFeedbackComment('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not submit feedback.", "error");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      request_submitted: { text: "Request Submitted", color: "bg-sky-100 text-sky-800 border-sky-300" },
      under_review: { text: "Under Review", color: "bg-purple-100 text-purple-800 border-purple-300" },
      quotation_sent: { text: "Quotation Sent", color: "bg-amber-100 text-amber-800 border-amber-300" },
      quotation_approved: { text: "Quotation Approved", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
      quotation_rejected: { text: "Quotation Rejected", color: "bg-rose-100 text-rose-800 border-rose-300" },
      worker_assigned: { text: "Worker Assigned", color: "bg-blue-100 text-blue-800 border-blue-300" },
      on_the_way: { text: "Technician On The Way", color: "bg-cyan-100 text-cyan-800 border-cyan-300" },
      in_progress: { text: "Work In Progress", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
      work_completed: { text: "Work Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
      payment_verified: { text: "Payment Verified", color: "bg-teal-100 text-teal-800 border-teal-300" },
      closed: { text: "Service Closed", color: "bg-slate-100 text-slate-800 border-slate-300" },
    };
    const s = map[status] || { text: status.replace('_', ' '), color: "bg-gray-100 text-gray-800 border-gray-300" };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-extrabold text-solar-navy">Customer Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome, {user?.name}! Manage your solar installations and service tickets.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => { setBookingType('installation'); setActiveTab('book'); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:scale-105 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Installation</span>
          </button>
          <button
            onClick={() => { setBookingType('maintenance'); setActiveTab('book'); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-105 transition-all flex items-center space-x-1.5"
          >
            <Wrench className="w-4 h-4" />
            <span>Book Maintenance</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-solar-sky">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests</span>
          <div className="text-3xl font-black text-solar-navy mt-1">{stats?.total_requests || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-amber-400">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Quotes</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.pending_quotations || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-solar-deepBlue">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Services</span>
          <div className="text-3xl font-black text-solar-deepBlue mt-1">{stats?.active_services || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-emerald-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats?.completed_services || 0}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-sky-200 mb-6 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-solar-deepBlue text-solar-deepBlue'
              : 'border-transparent text-slate-500 hover:text-solar-navy'
          }`}
        >
          My Service Tickets ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'book'
              ? 'border-solar-deepBlue text-solar-deepBlue'
              : 'border-transparent text-slate-500 hover:text-solar-navy'
          }`}
        >
          Submit New Service Request
        </button>
      </div>

      {/* TAB CONTENT 1: SERVICE REQUESTS LIST */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading your solar records...</div>
          ) : requests.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center space-y-4">
              <Sun className="w-12 h-12 text-sky-400 mx-auto animate-spin-slow" />
              <h3 className="text-lg font-bold text-solar-navy">No Service Requests Found</h3>
              <p className="text-xs text-slate-500">You haven't submitted any solar installation or maintenance tickets yet.</p>
              <button
                onClick={() => setActiveTab('book')}
                className="px-6 py-2.5 bg-solar-deepBlue text-white font-bold text-xs rounded-xl"
              >
                Book Your First Service
              </button>
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                className="glass-panel rounded-3xl p-6 sm:p-8 text-left border border-sky-100 shadow-md space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-lg text-solar-navy">{req.request_code}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-solar-deepBlue text-xs font-bold uppercase">
                        {req.service_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.service_address}, {req.city} - {req.pincode}</span>
                    </p>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                {/* Problem / Specs Description */}
                <div className="bg-sky-50/50 p-4 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-slate-700">Service Requirements:</span>
                  <p className="text-slate-600">{req.problem_description}</p>
                  {req.capacity_kw && (
                    <div className="pt-1 text-solar-deepBlue font-semibold">
                      Target Solar Capacity: {req.capacity_kw} kW ({req.property_type})
                    </div>
                  )}
                </div>

                {/* Quotation Section */}
                {req.quotation ? (
                  <div className="p-5 rounded-2xl bg-white border border-sky-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-solar-deepBlue" />
                        <h4 className="text-xs font-bold text-solar-navy uppercase tracking-wider">Itemized Quotation</h4>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.quotation.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.quotation.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        Quotation {req.quotation.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-500">Material Cost:</span>
                        <p className="font-bold text-slate-800">₹{req.quotation.material_cost?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Labour Charges:</span>
                        <p className="font-bold text-slate-800">₹{req.quotation.labour_charges?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Additional Charges:</span>
                        <p className="font-bold text-slate-800">₹{req.quotation.additional_charges?.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Estimated Duration:</span>
                        <p className="font-bold text-slate-800">{req.quotation.estimated_duration}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500">Total Quotation Amount:</span>
                        <div className="text-xl font-black text-solar-deepBlue">
                          ₹{req.quotation.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Approval buttons if status is 'sent' */}
                      {req.quotation.status === 'sent' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setRejectQuoteModal(req.quotation)}
                            className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors"
                          >
                            Reject / Revise
                          </button>
                          <button
                            onClick={() => handleQuotationDecision(req.quotation.id, true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                          >
                            Approve Quotation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 flex items-center space-x-2">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>Admin is evaluating your site requirements. An itemized quotation will appear here shortly.</span>
                  </div>
                )}

                {/* Assigned Worker Info (Visible after quotation approval) */}
                {req.assigned_worker && (
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-cyan-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-solar-deepBlue text-white font-bold flex items-center justify-center text-sm shadow">
                        {req.assigned_worker.full_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-solar-navy">{req.assigned_worker.full_name}</h4>
                          <span className="text-[10px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-mono">
                            {req.assigned_worker.worker_code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{req.assigned_worker.skills}</p>
                      </div>
                    </div>

                    <div className="text-xs text-right space-y-1">
                      <div className="flex items-center space-x-1.5 text-solar-deepBlue font-semibold">
                        <Calendar className="w-4 h-4" />
                        <span>Scheduled: {req.assigned_worker.scheduled_date} at {req.assigned_worker.scheduled_time}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span>Direct Technician Contact: {req.assigned_worker.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Footer: Payment & Feedback */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-sky-100">
                  <div className="text-xs text-slate-500">
                    Created on {new Date(req.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Pay Button if work is in progress or completed and not yet verified */}
                    {req.quotation && req.quotation.status === 'approved' && (!req.payment || req.payment.status === 'pending') && (
                      <button
                        onClick={() => setActiveQRModal(req)}
                        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>{req.payment ? 'Update Payment Reference' : 'Pay via Company UPI QR'}</span>
                      </button>
                    )}

                    {/* Paid badge if payment is verified */}
                    {req.payment && req.payment.status === 'verified' && (
                      <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payment Verified (₹{req.payment.amount})</span>
                      </div>
                    )}

                    {/* Rate & Feedback button if completed */}
                    {['work_completed', 'payment_verified', 'closed'].includes(req.status) && !req.has_feedback && (
                      <button
                        onClick={() => setFeedbackModalRequest(req)}
                        className="px-4 py-2 border border-solar-deepBlue text-solar-deepBlue hover:bg-sky-50 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                      >
                        <Star className="w-4 h-4 text-amber-500" />
                        <span>Rate Service</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT 2: BOOKING FORM */}
      {activeTab === 'book' && (
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl shadow-xl text-left">
          <div className="mb-6 space-y-1">
            <h3 className="text-2xl font-bold text-solar-navy">Book a Solar Service</h3>
            <p className="text-xs text-slate-500">Submit rooftop details for admin review and transparent quotation generation.</p>
          </div>

          {/* Service Type Switch */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setBookingType('installation')}
              className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
                bookingType === 'installation'
                  ? 'bg-solar-deepBlue text-white border-solar-deepBlue shadow-md'
                  : 'bg-white text-slate-600 border-sky-200 hover:bg-sky-50'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Solar Installation</span>
            </button>
            <button
              type="button"
              onClick={() => setBookingType('maintenance')}
              className={`py-3 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all ${
                bookingType === 'maintenance'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                  : 'bg-white text-slate-600 border-sky-200 hover:bg-sky-50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Solar Maintenance</span>
            </button>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            {bookingType === 'installation' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rooftop / Property Type</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  >
                    <option>Residential Rooftop (RCC)</option>
                    <option>Commercial Building</option>
                    <option>Industrial Shed / Sheet Roof</option>
                    <option>Agricultural Pump Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Desired Solar Capacity (kW)</label>
                  <select
                    value={formData.capacity_kw}
                    onChange={(e) => setFormData({ ...formData, capacity_kw: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  >
                    <option value="3.0">3 kW (Saves ~350 units/mo)</option>
                    <option value="5.0">5 kW (Saves ~600 units/mo)</option>
                    <option value="10.0">10 kW (Commercial / Villa)</option>
                    <option value="15.0">15 kW+ (Custom Industrial)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Category</label>
                <select
                  value={formData.problem_category}
                  onChange={(e) => setFormData({ ...formData, problem_category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <option>Low Power Generation / Dust Accumulation</option>
                  <option>Inverter Red Light Error / Trip</option>
                  <option>Loose Cable / Hotspot Heating</option>
                  <option>Physical Panel Glass Damage</option>
                  <option>Net Metering & Grid Sync Issue</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {bookingType === 'installation' ? 'Installation Requirements' : 'Problem Description'} *
              </label>
              <textarea
                rows={3}
                required
                value={formData.problem_description}
                onChange={(e) => setFormData({ ...formData, problem_description: e.target.value })}
                placeholder={
                  bookingType === 'installation'
                    ? "e.g. 5kW On-grid system with mono-PERC panels, 2nd floor terrace, 400 sq.ft available area."
                    : "e.g. Daily generation reduced from 20 units to 11 units. Inverter display shows error E03."
                }
                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Address *</label>
              <input
                type="text"
                required
                value={formData.service_address}
                onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                placeholder="Plot No., Street Name, Landmark"
                className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Chennai"
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="600042"
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingBooking}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center space-x-2 transition-all mt-4 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submittingBooking ? 'Submitting Service Request...' : 'Submit Service Ticket'}</span>
            </button>
          </form>
        </div>
      )}

      {/* UPI QR PAYMENT MODAL */}
      {activeQRModal && (
        <CompanyUPIQRCode
          isOpen={!!activeQRModal}
          onClose={() => setActiveQRModal(null)}
          requestId={activeQRModal.id}
          quotationId={activeQRModal.quotation?.id}
          amount={activeQRModal.quotation?.total_amount}
          requestCode={activeQRModal.request_code}
          onPaymentSuccess={() => {
            fetchData();
            setActiveQRModal(null);
          }}
        />
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Rate Technician Service</h3>
              <button onClick={() => setFeedbackModalRequest(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">Service: {feedbackModalRequest.request_code}</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= feedbackRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Review / Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="How was the quality of work, punctuality, and cleanliness?"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-solar-deepBlue text-white font-bold rounded-xl text-xs shadow-md"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REJECT / REVISE QUOTATION MODAL */}
      {rejectQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Quotation Revision Request</h3>
              <button onClick={() => setRejectQuoteModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-xs text-slate-500">Provide details on what you would like revised in this quotation.</p>

            <div className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Please specify modular structure brand or adjust inverter capacity."
                className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />

              <button
                onClick={() => handleQuotationDecision(rejectQuoteModal.id, false, rejectReason)}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Submit Revision Request to Admin
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
