import React, { useState } from 'react';
import { QrCode, CheckCircle, ShieldCheck, Upload, X, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';

export const CompanyUPIQRCode = ({
  requestId,
  quotationId,
  amount,
  requestCode,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const companyUpi = "solarfielddesk@upi";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(companyUpi);
    setCopied(true);
    showToast("UPI ID copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transactionRef.trim()) {
      showToast("Please enter the 12-digit UPI reference / transaction ID.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/customer/payments', {
        request_id: requestId,
        quotation_id: quotationId,
        payment_method: 'upi_qr',
        amount: amount,
        transaction_ref: transactionRef,
      });

      showToast("Payment recorded! Submitted to Admin for verification.", "success");
      if (onPaymentSuccess) onPaymentSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to record payment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden relative animate-scaleUp">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-yellow-300" />
            <h3 className="font-bold text-lg">Official Company UPI Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Business Payment Gateway</span>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Service Request</span>
            <p className="font-bold text-slate-800">{requestCode}</p>
          </div>

          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-600 font-medium">Total Amount Payable</span>
            <div className="text-3xl font-extrabold text-solar-deepBlue mt-1">
              ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Realistic High-Res Vector QR Code */}
          <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl border-2 border-sky-300 shadow-md flex items-center justify-center">
            {/* SVG QR Code Pattern */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Corner Targets */}
              <rect x="5" y="5" width="26" height="26" rx="4" fill="#0284C7" />
              <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="13" width="10" height="10" fill="#0284C7" />

              <rect x="69" y="5" width="26" height="26" rx="4" fill="#0284C7" />
              <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
              <rect x="77" y="13" width="10" height="10" fill="#0284C7" />

              <rect x="5" y="69" width="26" height="26" rx="4" fill="#0284C7" />
              <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
              <rect x="13" y="77" width="10" height="10" fill="#0284C7" />

              {/* Data Matrix Dots */}
              <rect x="36" y="8" width="8" height="4" fill="#0F2A43" />
              <rect x="48" y="8" width="6" height="4" fill="#0F2A43" />
              <rect x="40" y="16" width="6" height="6" fill="#0F2A43" />
              <rect x="56" y="16" width="8" height="4" fill="#0F2A43" />

              <rect x="8" y="38" width="6" height="8" fill="#0F2A43" />
              <rect x="20" y="44" width="6" height="6" fill="#0F2A43" />
              <rect x="8" y="54" width="8" height="4" fill="#0F2A43" />

              <rect x="38" y="38" width="24" height="24" rx="4" fill="#E0F2FE" />
              <circle cx="50" cy="50" r="7" fill="#FACC15" />
              <polygon points="50,45 52,49 48,51 51,55 49,55 48,51 52,49" fill="#0F2A43" />

              <rect x="68" y="38" width="8" height="6" fill="#0F2A43" />
              <rect x="80" y="46" width="12" height="6" fill="#0F2A43" />
              <rect x="70" y="56" width="8" height="8" fill="#0F2A43" />

              <rect x="38" y="70" width="8" height="6" fill="#0F2A43" />
              <rect x="52" y="76" width="10" height="6" fill="#0F2A43" />
              <rect x="42" y="84" width="6" height="8" fill="#0F2A43" />
              <rect x="58" y="86" width="8" height="6" fill="#0F2A43" />

              <rect x="70" y="72" width="6" height="6" fill="#0F2A43" />
              <rect x="82" y="72" width="10" height="6" fill="#0F2A43" />
              <rect x="76" y="84" width="16" height="6" fill="#0F2A43" />
            </svg>
            <div className="absolute inset-x-0 bottom-1 text-[10px] font-bold text-slate-500 uppercase">
              Scan with any UPI App
            </div>
          </div>

          {/* Copyable UPI ID */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="font-mono text-slate-700 font-semibold">{companyUpi}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center space-x-1 text-solar-deepBlue font-semibold hover:text-sky-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UPI Reference / UTR Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. 423456789012"
                className="w-full px-3 py-2 border border-sky-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/25 transition-all text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Verification...' : 'Submit Payment Reference'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
