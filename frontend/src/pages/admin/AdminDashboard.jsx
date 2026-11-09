import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Wrench,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Search,
  Filter,
  BarChart3,
  Check,
  X,
  Camera,
  Star,
  Clock,
  Layers,
} from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [paymentsData, setPaymentsData] = useState({ payments: [], cash_deposits: [] });
  const [monitoringList, setMonitoringList] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [requestFilter, setRequestFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Action States
  const [quoteModalRequest, setQuoteModalRequest] = useState(null);
  const [materialCost, setMaterialCost] = useState('');
  const [labourCharges, setLabourCharges] = useState('');
  const [additionalCharges, setAdditionalCharges] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('2-3 Days');
  const [quoteNotes, setQuoteNotes] = useState('');

  const [assignModalRequest, setAssignModalRequest] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('09:30 AM');
  const [assignInstructions, setAssignInstructions] = useState('');

  const [newWorkerModal, setNewWorkerModal] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: 'Worker@123',
    skills: 'Rooftop Mounting, Inverter Diagnostics, Wiring',
    experience_years: 3.0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqRes, workersRes, custRes, payRes, monRes, repRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/requests'),
        api.get('/admin/workers'),
        api.get('/admin/customers'),
        api.get('/admin/payments'),
        api.get('/admin/monitoring'),
        api.get('/admin/reports'),
      ]);

      setStats(statsRes.data);
      setRequests(reqRes.data);
      setWorkers(workersRes.data);
      setCustomers(custRes.data);
      setPaymentsData(payRes.data);
      setMonitoringList(monRes.data);
      setReports(repRes.data);
    } catch (err) {
      showToast("Failed to load admin management records.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Quotation Creation
  const handleSendQuotation = async (e) => {
    e.preventDefault();
    if (!quoteModalRequest) return;

    try {
      await api.post(`/admin/requests/${quoteModalRequest.id}/quotation`, {
        material_cost: parseFloat(materialCost) || 0,
        labour_charges: parseFloat(labourCharges) || 0,
        additional_charges: parseFloat(additionalCharges) || 0,
        estimated_duration: estimatedDuration,
        notes: quoteNotes,
      });

      showToast(`Quotation prepared & sent to customer for ${quoteModalRequest.request_code}!`, 'success');
      setQuoteModalRequest(null);
      setMaterialCost('');
      setLabourCharges('');
      setAdditionalCharges('');
      setQuoteNotes('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to create quotation.", "error");
    }
  };

  // Handle Worker Assignment
  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!assignModalRequest || !selectedWorkerId || !scheduledDate) {
      showToast("Please choose a technician and scheduled date.", "error");
      return;
    }

    try {
      await api.post(`/admin/requests/${assignModalRequest.id}/assign-worker`, {
        worker_id: parseInt(selectedWorkerId),
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        instructions: assignInstructions,
      });

      showToast(`Worker dispatched to ${assignModalRequest.request_code}!`, 'success');
      setAssignModalRequest(null);
      setSelectedWorkerId('');
      setScheduledDate('');
      setAssignInstructions('');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to assign worker.", "error");
    }
  };

  // Handle New Worker Creation
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/workers', {
        email: workerForm.email,
        password: workerForm.password,
        full_name: workerForm.full_name,
        phone: workerForm.phone,
        skills: workerForm.skills,
        experience_years: parseFloat(workerForm.experience_years),
      });

      showToast("Technician account created successfully!", "success");
      setNewWorkerModal(false);
      setWorkerForm({
        full_name: '',
        email: '',
        phone: '',
        password: 'Worker@123',
        skills: 'Rooftop Mounting, Inverter Diagnostics, Wiring',
        experience_years: 3.0,
      });
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to create worker.", "error");
    }
  };

  // Handle Payment Verification
  const handleVerifyPayment = async (paymentId) => {
    try {
      await api.post(`/admin/payments/${paymentId}/verify`);
      showToast("Payment verified! Customer receipt generated.", "success");
      fetchData();
    } catch (err) {
      showToast("Could not verify payment.", "error");
    }
  };

  // Handle Cash Deposit Verification
  const handleVerifyCashDeposit = async (depositId) => {
    try {
      await api.post(`/admin/cash-deposits/${depositId}/verify`);
      showToast("Worker cash handover verified and added to company vault!", "success");
      fetchData();
    } catch (err) {
      showToast("Could not verify cash deposit.", "error");
    }
  };

  // Handle Official Service Closure
  const handleCloseRequest = async (requestId) => {
    try {
      await api.post(`/admin/requests/${requestId}/close`);
      showToast("Service ticket officially closed!", "success");
      fetchData();
    } catch (err) {
      showToast("Could not close service ticket.", "error");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesFilter =
      requestFilter === 'all'
        ? true
        : requestFilter === 'installation' || requestFilter === 'maintenance'
        ? r.service_type === requestFilter
        : r.status === requestFilter;

    const matchesSearch =
      r.request_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-extrabold text-solar-navy">Admin Control Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-solar-deepBlue text-xs font-bold uppercase">
              Management Suite
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Control service tickets, calculate quotations, assign workers, and audit double-entry payments.
          </p>
        </div>

        <button
          onClick={() => setNewWorkerModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 hover:scale-105 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Field Worker</span>
        </button>
      </div>

      {/* KPI Ribbon (8 Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-solar-navy">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Customers</span>
          <div className="text-xl font-black text-solar-navy">{stats?.total_customers || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-solar-deepBlue">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Technicians</span>
          <div className="text-xl font-black text-solar-deepBlue">{stats?.total_workers || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-sky-400">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Total Tickets</span>
          <div className="text-xl font-black text-slate-800">{stats?.total_requests || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-amber-400">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Quotes Pending</span>
          <div className="text-xl font-black text-amber-600">{stats?.pending_quotations || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-blue-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Confirmed</span>
          <div className="text-xl font-black text-blue-600">{stats?.confirmed_services || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-cyan-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Active Jobs</span>
          <div className="text-xl font-black text-cyan-700">{stats?.active_jobs || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-emerald-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Completed</span>
          <div className="text-xl font-black text-emerald-600">{stats?.completed_jobs || 0}</div>
        </div>
        <div className="glass-panel p-3.5 rounded-2xl text-left border-l-4 border-teal-500">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Verified Rev</span>
          <div className="text-sm font-black text-emerald-700 truncate">
            ₹{stats?.total_revenue?.toLocaleString('en-IN') || 0}
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex overflow-x-auto border-b border-sky-200 mb-6 space-x-6 text-sm font-bold pb-2">
        {[
          { key: 'requests', label: `Service Requests (${requests.length})`, icon: FileText },
          { key: 'monitoring', label: `Work Monitoring (${monitoringList.length})`, icon: Camera },
          { key: 'payments', label: `Payments & Cash (${paymentsData.payments.length + paymentsData.cash_deposits.length})`, icon: DollarSign },
          { key: 'workers', label: `Technicians (${workers.length})`, icon: Wrench },
          { key: 'customers', label: `Customers (${customers.length})`, icon: Users },
          { key: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 whitespace-nowrap pb-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-solar-deepBlue text-solar-deepBlue'
                  : 'border-transparent text-slate-500 hover:text-solar-navy'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: SERVICE REQUESTS ================= */}
      {activeTab === 'requests' && (
        <div className="space-y-4 text-left">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 rounded-2xl border border-sky-100 shadow-sm">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-sky-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">All Service Tickets</option>
                <option value="installation">Installation Requests Only</option>
                <option value="maintenance">Maintenance Requests Only</option>
                <option value="request_submitted">Needs Review (New)</option>
                <option value="quotation_sent">Quotation Sent</option>
                <option value="quotation_approved">Approved (Ready to Assign)</option>
                <option value="in_progress">In Progress</option>
                <option value="work_completed">Work Completed</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket code, customer, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sky-50/80 border-b border-sky-100 text-slate-600 uppercase tracking-wider font-bold">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Type & Capacity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Quotation</th>
                  <th className="p-4">Technician</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="p-4">
                      <span className="font-extrabold text-solar-navy">{r.request_code}</span>
                      <p className="text-[10px] text-slate-400">{r.city}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-800">{r.customer.name}</span>
                      <p className="text-[10px] text-slate-500">{r.customer.phone}</p>
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-bold text-solar-deepBlue">{r.service_type}</span>
                      <p className="text-[10px] text-slate-500">
                        {r.capacity_kw ? `${r.capacity_kw} kW` : r.problem_category || 'General'}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {r.quotation ? (
                        <div>
                          <span>₹{r.quotation.total_amount?.toLocaleString('en-IN')}</span>
                          <span className="block text-[10px] text-slate-400 capitalize">({r.quotation.status})</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-normal">Pending Quote</span>
                      )}
                    </td>
                    <td className="p-4">
                      {r.assigned_worker ? (
                        <div>
                          <span className="font-semibold text-slate-800">{r.assigned_worker.name}</span>
                          <span className="block text-[10px] text-slate-400">{r.assigned_worker.date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Prepare quote if none or rejected */}
                      {(!r.quotation || r.quotation.status === 'rejected') && (
                        <button
                          onClick={() => setQuoteModalRequest(r)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-[11px]"
                        >
                          Build Quote
                        </button>
                      )}

                      {/* Assign worker if quotation is approved and unassigned */}
                      {r.status === 'quotation_approved' && (
                        <button
                          onClick={() => setAssignModalRequest(r)}
                          className="px-2.5 py-1 bg-solar-deepBlue hover:bg-sky-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Assign Worker
                        </button>
                      )}

                      {/* Close service if payment is verified */}
                      {r.status === 'payment_verified' && (
                        <button
                          onClick={() => handleCloseRequest(r.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                        >
                          Close Ticket
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: WORK MONITORING ================= */}
      {activeTab === 'monitoring' && (
        <div className="space-y-4 text-left">
          <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
            Live Field Progress & Photos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monitoringList.map((m, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl space-y-4 border border-sky-100 shadow-md">
                <div className="flex justify-between items-center pb-3 border-b border-sky-100">
                  <span className="font-extrabold text-sm text-solar-navy">{m.request_code}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-solar-deepBlue uppercase">
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-bold">Customer:</span> {m.customer_name}</p>
                  <p><span className="font-bold">Technician:</span> {m.worker_name} ({m.worker_phone})</p>
                  <p><span className="font-bold">Scheduled:</span> {m.scheduled_date}</p>
                  <p><span className="font-bold">Latest Update:</span> {m.latest_update}</p>
                </div>

                {/* Photo Previews */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Proof Photos ({m.photos_count})
                  </span>
                  {m.photos && m.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {m.photos.map((p, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-sky-200 aspect-video bg-slate-100">
                          <img
                            src={p.url}
                            alt="Work proof"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=400";
                            }}
                          />
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded uppercase">
                            {p.type?.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-400 text-center">
                      No photos submitted yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PAYMENTS & CASH LEDGER ================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6 text-left">
          
          {/* Digital UPI Payments */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
              Digital UPI Payments ({paymentsData.payments.length})
            </h3>
            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sky-50/80 border-b border-sky-100 text-slate-600 font-bold uppercase">
                    <th className="p-4">Request</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Reference / Proof</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsData.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-sky-50/30">
                      <td className="p-4 font-bold text-solar-navy">{p.request_code}</td>
                      <td className="p-4">{p.customer_name} ({p.customer_phone})</td>
                      <td className="p-4 uppercase font-bold text-solar-deepBlue">{p.payment_method}</td>
                      <td className="p-4 font-black text-slate-800">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-600">{p.transaction_ref || 'Direct UPI'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleVerifyPayment(p.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Verify Payment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Worker Cash Handover Ledger */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
              Technician Cash Handover Deposits ({paymentsData.cash_deposits.length})
            </h3>
            <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-amber-50/80 border-b border-amber-100 text-slate-600 font-bold uppercase">
                    <th className="p-4">Technician</th>
                    <th className="p-4">Worker Code</th>
                    <th className="p-4">Cash Amount</th>
                    <th className="p-4">Handover Memo</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsData.cash_deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-amber-50/30">
                      <td className="p-4 font-bold text-slate-800">{d.worker_name}</td>
                      <td className="p-4 font-mono text-slate-600">{d.worker_code}</td>
                      <td className="p-4 font-black text-emerald-700">₹{d.amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 text-slate-600">{d.reference_note}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          d.deposit_status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.deposit_status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {d.deposit_status === 'pending_handover' && (
                          <button
                            onClick={() => handleVerifyCashDeposit(d.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                          >
                            Confirm Cash Received
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 4: TECHNICIANS DIRECTORY ================= */}
      {activeTab === 'workers' && (
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
              Field Workforce Roster ({workers.length})
            </h3>
            <button
              onClick={() => setNewWorkerModal(true)}
              className="px-3 py-1.5 bg-solar-deepBlue text-white font-bold rounded-xl text-xs flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Worker</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workers.map((w) => (
              <div key={w.id} className="glass-panel p-6 rounded-3xl border border-sky-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full">
                    {w.worker_code}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{w.average_rating}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-solar-navy">{w.full_name}</h4>
                  <p className="text-xs text-slate-500">{w.email} | {w.phone}</p>
                </div>

                <div className="text-xs text-slate-600 bg-sky-50/50 p-2.5 rounded-xl space-y-0.5">
                  <p><span className="font-semibold">Skills:</span> {w.skills}</p>
                  <p><span className="font-semibold">Experience:</span> {w.experience_years} Years</p>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs border-t border-slate-100">
                  <span className="text-slate-500">Active Jobs: <strong className="text-solar-deepBlue">{w.active_jobs_count}</strong></span>
                  <span className="text-slate-500">Completed: <strong className="text-emerald-600">{w.completed_jobs_count}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: CUSTOMER DIRECTORY ================= */}
      {activeTab === 'customers' && (
        <div className="space-y-4 text-left">
          <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
            Registered Customers ({customers.length})
          </h3>

          <div className="bg-white rounded-3xl border border-sky-100 overflow-hidden shadow-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-sky-50/80 border-b border-sky-100 text-slate-600 font-bold uppercase">
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Service Address</th>
                  <th className="p-4">Total Requests</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-sky-50/30">
                    <td className="p-4 font-bold text-solar-navy">{c.full_name}</td>
                    <td className="p-4 text-slate-600">{c.email}</td>
                    <td className="p-4 font-mono text-slate-700">{c.phone}</td>
                    <td className="p-4 font-semibold text-solar-deepBlue">{c.city}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{c.address}</td>
                    <td className="p-4 font-bold text-slate-800">{c.total_requests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: REPORTS & ANALYTICS ================= */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-6 text-left">
          <h3 className="font-bold text-sm text-solar-navy uppercase tracking-wider">
            System Operations & Revenue Analytics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl space-y-2 border-l-4 border-solar-sky">
              <span className="text-xs text-slate-500 font-bold uppercase">Solar Installation Volume</span>
              <div className="text-3xl font-black text-solar-navy">{reports.installations_count} Requests</div>
              <p className="text-xs text-slate-500">Turnkey rooftop photovoltaic systems</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-l-4 border-amber-400">
              <span className="text-xs text-slate-500 font-bold uppercase">Solar Maintenance Volume</span>
              <div className="text-3xl font-black text-amber-600">{reports.maintenance_count} Requests</div>
              <p className="text-xs text-slate-500">Module cleaning & inverter servicing</p>
            </div>

            <div className="glass-panel p-6 rounded-3xl space-y-2 border-l-4 border-emerald-500">
              <span className="text-xs text-slate-500 font-bold uppercase">Customer Satisfaction</span>
              <div className="text-3xl font-black text-emerald-600">{reports.average_customer_rating} / 5.0 ★</div>
              <p className="text-xs text-slate-500">Verified post-service reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* BUILD QUOTATION MODAL */}
      {quoteModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-lg text-solar-navy">Prepare Itemized Quotation</h3>
                <p className="text-xs text-slate-500">{quoteModalRequest.request_code} | {quoteModalRequest.service_type.toUpperCase()}</p>
              </div>
              <button onClick={() => setQuoteModalRequest(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleSendQuotation} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Material Cost (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={materialCost}
                    onChange={(e) => setMaterialCost(e.target.value)}
                    placeholder="e.g. 195000"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Labour Charges (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={labourCharges}
                    onChange={(e) => setLabourCharges(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Additional Charges (₹)</label>
                  <input
                    type="number"
                    step="any"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                    placeholder="e.g. 2-3 Days"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated Total */}
              <div className="p-3 bg-sky-50 rounded-xl flex justify-between items-center border border-sky-200">
                <span className="text-xs font-bold text-solar-navy">Calculated Total Amount:</span>
                <span className="text-lg font-black text-solar-deepBlue">
                  ₹{(
                    (parseFloat(materialCost) || 0) +
                    (parseFloat(labourCharges) || 0) +
                    (parseFloat(additionalCharges) || 0)
                  ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quotation Notes / Specification Breakdown</label>
                <textarea
                  rows={2}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Includes 10x 540W Mono-PERC modules, 5kW On-grid inverter, mounting structure and earthing."
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-solar-deepBlue text-white font-bold rounded-xl text-xs shadow-md hover:bg-sky-700 transition-colors"
              >
                Send Quotation to Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN WORKER MODAL */}
      {assignModalRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-bold text-lg text-solar-navy">Dispatch Field Technician</h3>
                <p className="text-xs text-slate-500">Service: {assignModalRequest.request_code} in {assignModalRequest.city}</p>
              </div>
              <button onClick={() => setAssignModalRequest(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleAssignWorker} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Available Worker *</label>
                <select
                  required
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                >
                  <option value="">-- Choose Technician --</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.full_name} ({w.worker_code}) - {w.skills} [Active Jobs: {w.active_jobs_count}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    placeholder="09:30 AM"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Technician Job Instructions</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="e.g. Conduct terrace angle check, inspect existing grid connection, bring MC4 crimping tool."
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-solar-deepBlue text-white font-bold rounded-xl text-xs shadow-md"
              >
                Confirm Worker Assignment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW WORKER MODAL */}
      {newWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-bold text-lg text-solar-navy">Add New Field Technician</h3>
              <button onClick={() => setNewWorkerModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={handleCreateWorker} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={workerForm.full_name}
                  onChange={(e) => setWorkerForm({ ...workerForm, full_name: e.target.value })}
                  placeholder="e.g. Selvam Murugan"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={workerForm.email}
                    onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                    placeholder="selvam@solar.com"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    placeholder="98401 22334"
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Skills & Specialities</label>
                <input
                  type="text"
                  value={workerForm.skills}
                  onChange={(e) => setWorkerForm({ ...workerForm, skills: e.target.value })}
                  placeholder="e.g. Rooftop Mounting, Inverter Diagnostics"
                  className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={workerForm.experience_years}
                    onChange={(e) => setWorkerForm({ ...workerForm, experience_years: e.target.value })}
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Login Password *</label>
                  <input
                    type="text"
                    required
                    value={workerForm.password}
                    onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
                    className="w-full px-3 py-2 border border-sky-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-solar-deepBlue text-white font-bold rounded-xl text-xs shadow-md mt-2"
              >
                Create Field Worker Credentials
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
