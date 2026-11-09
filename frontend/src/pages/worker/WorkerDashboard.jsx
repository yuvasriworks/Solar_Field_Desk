import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  QrCode,
  DollarSign,
  Camera,
  Navigation,
  FileCheck,
  Send,
  User,
  ArrowRight,
  X,
  Shield,
  Layers,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { CompanyUPIQRCode } from '../../components/common/CompanyUPIQRCode';

export const WorkerDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('jobs');
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected job for actions
  const [selectedJob, setSelectedJob] = useState(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [cashCollectModal, setCashCollectModal] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [cashDepositModal, setCashDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [qrModalJob, setQrModalJob] = useState(null);

  // Photo upload state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoType, setPhotoType] = useState('before_work');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, jobsRes] = await Promise.all([
        api.get('/worker/dashboard-stats'),
        api.get('/worker/jobs'),
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
      if (jobsRes.data.length > 0 && !selectedJob) {
        setSelectedJob(jobsRes.data[0]);
      }
    } catch (err) {
      showToast("Failed to load worker jobs.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.post(`/worker/jobs/${requestId}/status`, { status: newStatus });
      showToast(`Status updated to ${newStatus.replace('_', ' ')}!`, 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not update status.", "error");
    }
  };

  const handleCompleteWork = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      await api.post(`/worker/jobs/${selectedJob.request_id}/complete`, {
        completion_notes: completionNotes,
        materials_used: materialsUsed,
      });
      showToast("Work completion report submitted to Admin!", "success");
      setCompletionModalOpen(false);
      setCompletionNotes('');
      setMaterialsUsed('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to submit completion report.", "error");
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!selectedJob || !photoUrl.trim()) return;

    try {
      await api.post(`/worker/jobs/${selectedJob.request_id}/photos`, null, {
        params: {
          photo_type: photoType,
          file_url: photoUrl,
          caption: photoCaption,
        },
      });
      showToast(`${photoType.replace('_', ' ')} photo recorded!`, "success");
      setPhotoModalOpen(false);
      setPhotoUrl('');
      setPhotoCaption('');
    } catch (err) {
      showToast("Could not save photo URL.", "error");
    }
  };

  const handleCashCollection = async (e) => {
    e.preventDefault();
    if (!selectedJob || !cashAmount) return;

    try {
      await api.post(`/worker/jobs/${selectedJob.request_id}/cash-collection`, null, {
        params: { amount: parseFloat(cashAmount) },
      });
      showToast(`Cash payment of ₹${cashAmount} recorded. Handover to Admin required.`, "success");
      setCashCollectModal(false);
      setCashAmount('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to record cash payment.", "error");
    }
  };

  const handleCashDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount) return;

    try {
      await api.post('/worker/cash-deposit', {
        amount: parseFloat(depositAmount),
        reference_note: depositNote || "Direct office cash handover",
      });
      showToast("Cash handover record submitted to Admin for verification!", "success");
      setCashDepositModal(false);
      setDepositAmount('');
      setDepositNote('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to submit cash handover.", "error");
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-solar-navy">Worker Field Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono text-xs font-bold">
              {stats?.worker_code || 'WRK-101'}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Technician: {stats?.worker_name || user?.name} | Assigned solar installation & maintenance work orders.
          </p>
        </div>

        <button
          onClick={() => setCashDepositModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:scale-105 transition-all flex items-center space-x-2"
        >
          <DollarSign className="w-4 h-4" />
          <span>Hand Over Cash to Admin</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-solar-deepBlue">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Jobs</span>
          <div className="text-3xl font-black text-solar-navy mt-1">{stats?.total_assigned || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-amber-400">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Arrival</span>
          <div className="text-3xl font-black text-amber-600 mt-1">{stats?.pending_jobs || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-solar-sky">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ongoing Works</span>
          <div className="text-3xl font-black text-solar-deepBlue mt-1">{stats?.ongoing_jobs || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-emerald-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
          <div className="text-3xl font-black text-emerald-600 mt-1">{stats?.completed_jobs || 0}</div>
        </div>
        <div className="glass-panel p-5 rounded-2xl text-left border-l-4 border-rose-500">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cash in Hand</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            ₹{stats?.cash_in_hand?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      {/* Main Jobs Layout: 2-Column (List on Left, Execution Detail on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider mb-2">
            My Assigned Jobs ({jobs.length})
          </h3>

          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading assignments...</div>
          ) : jobs.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-xs text-slate-500">
              No jobs currently assigned. Check with Admin for new work orders.
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.assignment_id}
                onClick={() => setSelectedJob(job)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  selectedJob?.assignment_id === job.assignment_id
                    ? 'bg-white border-solar-deepBlue shadow-lg ring-2 ring-sky-300'
                    : 'bg-white/70 border-sky-100 hover:bg-white hover:border-sky-300'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-sm text-solar-navy">{job.request_code}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-solar-deepBlue">
                    {job.service_type}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700">{job.customer.name}</p>
                <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{job.customer.city}</span>
                </p>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-500">Schedule: {job.scheduled_date}</span>
                  <span className="font-bold text-solar-deepBlue capitalize">{job.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Active Job Execution Desk */}
        <div className="lg:col-span-7">
          {selectedJob ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-sky-100">
              
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-sky-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-black text-solar-navy">{selectedJob.request_code}</h2>
                    <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                      {selectedJob.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Scheduled for {selectedJob.scheduled_date} at {selectedJob.scheduled_time}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500">Total Quotation</span>
                  <div className="text-xl font-bold text-solar-deepBlue">
                    ₹{selectedJob.quotation_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Customer & Location Details */}
              <div className="bg-sky-50/60 p-5 rounded-2xl border border-sky-100 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-solar-navy uppercase tracking-wider">Customer & Site Address</h4>
                  <a
                    href={`tel:${selectedJob.customer.phone}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-white border border-sky-200 text-solar-deepBlue text-xs font-bold hover:bg-sky-50 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-solar-deepBlue" />
                    <span>Call Customer: {selectedJob.customer.phone}</span>
                  </a>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p><span className="font-bold">Name:</span> {selectedJob.customer.name}</p>
                  <p><span className="font-bold">Address:</span> {selectedJob.customer.address}, {selectedJob.customer.city} - {selectedJob.customer.pincode}</p>
                  {selectedJob.capacity_kw && (
                    <p><span className="font-bold">PV Capacity:</span> {selectedJob.capacity_kw} kW ({selectedJob.property_type})</p>
                  )}
                  <p><span className="font-bold">Requirements:</span> {selectedJob.problem_description}</p>
                </div>

                {selectedJob.admin_instructions && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <span className="font-bold">Admin Special Instructions:</span> {selectedJob.admin_instructions}
                  </div>
                )}
              </div>

              {/* Progressive Status Update Buttons */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-solar-navy uppercase tracking-wider">Live Job Stage</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStatusChange(selectedJob.request_id, 'on_the_way')}
                    className="py-3 px-4 rounded-xl border border-cyan-400 bg-cyan-50 hover:bg-cyan-100 text-cyan-900 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-cyan-600" />
                    <span>1. On The Way</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(selectedJob.request_id, 'in_progress')}
                    className="py-3 px-4 rounded-xl border border-sky-400 bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Wrench className="w-4 h-4 text-solar-deepBlue" />
                    <span>2. In Progress</span>
                  </button>

                  <button
                    onClick={() => setCompletionModalOpen(true)}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>3. Complete Work</span>
                  </button>
                </div>
              </div>

              {/* Photos & Payments Tooling */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-sky-100">
                <button
                  onClick={() => setPhotoModalOpen(true)}
                  className="py-2.5 px-3 border border-sky-200 hover:border-sky-400 bg-white rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4 text-solar-deepBlue" />
                  <span>Upload Before/After</span>
                </button>

                <button
                  onClick={() => setQrModalJob(selectedJob)}
                  className="py-2.5 px-3 border border-sky-200 hover:border-sky-400 bg-white rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-2"
                >
                  <QrCode className="w-4 h-4 text-solar-deepBlue" />
                  <span>Show Company QR</span>
                </button>

                <button
                  onClick={() => {
                    setCashAmount(selectedJob.quotation_amount);
                    setCashCollectModal(true);
                  }}
                  className="py-2.5 px-3 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Record Cash Collection</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
              Select a job from the list to view instructions and update work progress.
            </div>
          )}
        </div>

      </div>

      {/* COMPLETION REPORT MODAL */}
      {completionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Submit Work Completion Report</h3>
              <button onClick={() => setCompletionModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCompleteWork} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Description & Observations *</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g. Structure mounted on south face at 15 deg tilt. Panels clamped, DC string wired and tested. Inverter generating 220V."
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Materials / Consumables Used</label>
                <textarea
                  rows={2}
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  placeholder="e.g. 10x 540W Mono-PERC modules, 35m 4sq.mm solar DC cable, 4x MC4 pairs, 2x earthing rods."
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl text-xs text-sky-800">
                Notice: Submitting this report will notify Admin to verify completion and confirm payment receipt.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Submit Completion to Admin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PHOTO UPLOAD MODAL */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Upload Work Proof Photo</h3>
              <button onClick={() => setPhotoModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handlePhotoUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Category</label>
                <select
                  value={photoType}
                  onChange={(e) => setPhotoType(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <option value="before_work">Before Work (Initial Site Condition)</option>
                  <option value="after_work">After Work (Completed Installation/Repair)</option>
                  <option value="site_inspection">Site Inspection / Meter Reading</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image URL or File Reference *</label>
                <input
                  type="text"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /uploads/photo.jpg"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Caption</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="e.g. Inverter wiring before maintenance"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-solar-deepBlue text-white font-bold rounded-xl text-xs shadow-md"
              >
                Save Photo Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECORD CASH COLLECTION MODAL */}
      {cashCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Record On-Site Cash Collection</h3>
              <button onClick={() => setCashCollectModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCashCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cash Amount Received (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-base font-bold text-solar-deepBlue focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900">
                Notice: Cash collected must be deposited with Admin. Payment is marked verified only after Admin confirms the cash handover.
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Cash Received on Site
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CASH HANDOVER TO ADMIN MODAL */}
      {cashDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Hand Over Cash to Admin</h3>
              <button onClick={() => setCashDepositModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <p className="text-xs text-slate-600">
              Submit the cash amount you are depositing at the office desk with Admin.
            </p>

            <form onSubmit={handleCashDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Amount (₹) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-base font-bold text-solar-deepBlue focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Handover Note / Receipt Memo</label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="e.g. Cash collected from Velachery site"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Submit Handover Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHOW COMPANY QR MODAL (from technician screen) */}
      {qrModalJob && (
        <CompanyUPIQRCode
          isOpen={!!qrModalJob}
          onClose={() => setQrModalJob(null)}
          requestId={qrModalJob.request_id}
          quotationId={1}
          amount={qrModalJob.quotation_amount}
          requestCode={qrModalJob.request_code}
          onPaymentSuccess={() => {
            setQrModalJob(null);
            fetchData();
          }}
        />
      )}

    </div>
  );
};
