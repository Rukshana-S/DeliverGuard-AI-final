import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolicy } from '../context/PolicyContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import PaymentModal from './PaymentModal';

const PLAN_RATES  = { basic: 5, standard: 8, premium: 10 };
const PLAN_LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const STEPS       = ['upload', 'scanning', 'confirm', 'payment', 'success'];

const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function UploadSalaryProof() {
  const { policy } = usePolicy();
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const fileRef    = useRef();

  const [step,          setStep]          = useState('upload');
  const [file,          setFile]          = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [weeklyIncome,  setWeeklyIncome]  = useState('');
  const [manualMode,    setManualMode]    = useState(false);
  const [error,         setError]         = useState('');
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [showModal,     setShowModal]     = useState(false);

  const planKey = policy?.planType?.toLowerCase();
  const rate    = PLAN_RATES[planKey] ?? 0;
  const premium = weeklyIncome ? Math.round((Number(weeklyIncome) * rate) / 100) : 0;

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  // Send image to backend → Gemini Vision extracts the ₹ amount
  const runExtract = async () => {
    if (!file) return;
    setStep('scanning');
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);

      const { data } = await api.post('/ocr/extract-income', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // backend returns { amount, weeklyIncome } — use whichever is present
      const detected = data.amount || data.weeklyIncome;
      setWeeklyIncome(String(detected));
      setManualMode(false);
    } catch (err) {
      setManualMode(true);
      setError(
        err.response?.data?.message ||
        'Could not detect amount. Please enter it manually below.'
      );
    } finally {
      setStep('confirm');
    }
  };

  const handlePay = () => {
    if (!weeklyIncome || Number(weeklyIncome) <= 0) { setError('Please enter a valid weekly income.'); return; }
    if (!policy) { setError('No active insurance plan found. Please select a plan first.'); return; }
    setError('');
    setStep('payment');
  };

  const handlePaymentSuccess = (data) => {
    setShowModal(false);
    setPaymentRecord(data);
    setStep('success');
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Header — hidden on payment/success full-screen steps */}
      {step !== 'payment' && step !== 'success' && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Upload Weekly Income Proof</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload a screenshot showing your salary credited to your bank account for last week.
          </p>
        </div>
      )}

      {/* Step indicator — hidden on payment/success */}
      {step !== 'payment' && step !== 'success' && (
        <div className="flex items-center gap-2">
        {[
          { key: 'upload',   label: 'Upload',  icon: '📤' },
          { key: 'scanning', label: 'Reading', icon: '🤖' },
          { key: 'confirm',  label: 'Premium', icon: '🧮' },
          { key: 'payment',  label: 'Pay',     icon: '🔐' },
          { key: 'success',  label: 'Done',    icon: '✅' },
        ].map(({ key, label, icon }, i, arr) => {
          const idx     = STEPS.indexOf(step);
          const thisIdx = STEPS.indexOf(key);
          const done    = thisIdx < idx;
          const active  = thisIdx === idx;
          return (
            <div key={key} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors
                ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs
                  ${active ? 'bg-blue-100 dark:bg-blue-900/40'
                    : done  ? 'bg-green-100 dark:bg-green-900/40'
                    :         'bg-gray-100 dark:bg-gray-800'}`}>
                  {done ? '✓' : icon}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-px ${done ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'}`} />
              )}
            </div>
          );
        })}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Upload ── */}
        {step === 'upload' && (
          <motion.div key="upload"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-4">

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors
                ${file
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'}`}
            >
              <input
                ref={fileRef} type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {preview ? (
                <div className="space-y-3">
                  <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-contain shadow" />
                  <p className="text-sm text-blue-600 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">Click to change</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-5xl">📤</div>
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Upload Salary Screenshot</p>
                  <p className="text-xs text-gray-400">Drag & drop or click to browse</p>
                  <div className="flex justify-center gap-2 mt-2">
                    {['JPG', 'PNG', 'WEBP', 'PDF'].map((f) => (
                      <span key={f} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!policy && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300">
                ⚠️ No active insurance plan.{' '}
                <button onClick={() => navigate('/coverage')} className="underline font-medium">
                  Select a plan first →
                </button>
              </div>
            )}

            <button
              onClick={runExtract}
              disabled={!file || !policy}
              className="w-full py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700
                disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400
                disabled:cursor-not-allowed transition-colors"
            >
              Extract Income
            </button>
          </motion.div>
        )}

        {/* ── STEP 2: AI Scanning ── */}
        {step === 'scanning' && (
          <motion.div key="scanning"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="card text-center space-y-5 py-12">
            <div className="text-5xl animate-pulse">🤖</div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              AI is reading your screenshot…
            </p>
            <p className="text-sm text-gray-400">
              Gemini Vision is extracting the ₹ amount from your payment receipt
            </p>
            <div className="flex justify-center gap-1.5 pt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Confirm premium ── */}
        {step === 'confirm' && (
          <motion.div key="confirm"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-4">

            {/* Extracted amount card */}
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧾</span>
                <p className="font-semibold text-gray-800 dark:text-gray-100">Detected Weekly Income</p>
              </div>

              {manualMode ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-600 dark:text-amber-400">{error}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                    <input
                      type="number"
                      value={weeklyIncome}
                      onChange={(e) => { setWeeklyIncome(e.target.value); setError(''); }}
                      placeholder="Enter weekly income"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 dark:border-gray-700
                        rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Extracted Amount</span>
                  <span className="text-2xl font-extrabold text-green-600 dark:text-green-400">
                    {fmt(weeklyIncome)}
                  </span>
                </div>
              )}

              {!manualMode && (
                <button onClick={() => setManualMode(true)} className="text-xs text-blue-500 underline">
                  Edit amount manually
                </button>
              )}
            </div>

            {/* Premium summary */}
            {weeklyIncome && Number(weeklyIncome) > 0 && policy && (
              <div className="card space-y-3 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🛡️</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">Weekly Premium Summary</p>
                </div>
                {[
                  { label: 'Plan',            value: PLAN_LABELS[planKey] ?? planKey },
                  { label: 'Weekly Income',   value: fmt(weeklyIncome) },
                  { label: 'Premium Rate',    value: `${rate}%` },
                  { label: 'Coverage Period', value: 'Next 7 Days' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{label}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Insurance Premium</span>
                  <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{fmt(premium)}</span>
                </div>
              </div>
            )}

            {error && !manualMode && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('upload'); setError(''); setManualMode(false); setWeeklyIncome(''); }}
                className="flex-1 py-3 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700
                  text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={!weeklyIncome || Number(weeklyIncome) <= 0 || !policy}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700
                  disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400
                  disabled:cursor-not-allowed transition-colors"
              >
                {`Pay ${fmt(premium)}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: GPay-style Payment Page ── */}
        {step === 'payment' && (
          <motion.div key="payment"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6"
            style={{ background: 'linear-gradient(160deg, #0f1420 0%, #1a1f2e 50%, #0d1117 100%)' }}
          >
            {/* Back button */}
            <button
              onClick={() => setStep('confirm')}
              className="absolute top-6 left-6 text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
            >
              ← Back
            </button>

            <div className="w-full max-w-sm space-y-6">
              {/* Avatar + title */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white mx-auto shadow-lg shadow-blue-500/30"
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </motion.div>
                <div>
                  <p className="text-white font-bold text-lg">Paying Weekly Premium</p>
                  <p className="text-gray-400 text-sm">Insurance Premium Payment</p>
                </div>
              </div>

              {/* Amount */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-5xl font-extrabold text-white tracking-tight">{fmt(premium)}</p>
                <p className="text-gray-500 text-xs mt-2">Income Loss Compensation</p>
              </motion.div>

              {/* Bank card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {user?.bankAccount?.bankName?.slice(0, 3)?.toUpperCase() || 'SBI'}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">
                    {user?.bankAccount?.bankName || 'Bank Account'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    ****{user?.bankAccount?.accountNumber?.slice(-4) || '0000'} · IMPS
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </motion.div>

              {/* Proceed button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(true)}
                className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}
              >
                Proceed to Pay →
              </motion.button>

              <p className="text-center text-xs text-gray-600">🔒 256-bit encrypted · Secured by DeliverGuard AI</p>
            </div>

            {/* Password Modal */}
            <PaymentModal
              show={showModal}
              onClose={() => setShowModal(false)}
              premium={premium}
              weeklyIncome={weeklyIncome}
              preview={preview}
              onSuccess={handlePaymentSuccess}
            />
          </motion.div>
        )}

        {/* ── STEP 5: Success ── */}
        {step === 'success' && paymentRecord && (
          <motion.div key="success"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 overflow-y-auto"
            style={{ background: 'linear-gradient(160deg, #0B1220 0%, #0F172A 100%)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22 }}
              className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 0 60px rgba(79,70,229,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              }}
            >
              {/* Top glow accent */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #4F46E5, #7C3AED, #4F46E5)' }} />

              <div className="px-6 py-7 space-y-6">

                {/* Header */}
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 0 24px rgba(124,58,237,0.5)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.div>
                  <h1 className="text-2xl font-extrabold text-white">
                    {fmt(paymentRecord.premiumAmount)} Premium Paid
                  </h1>
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    Your insurance coverage is now active for 7 days
                  </p>
                </div>

                {/* Receipt card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#64748B' }}>
                      Transaction Receipt
                    </p>
                  </div>
                  <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
                    {[
                      { label: 'Transaction ID', value: paymentRecord.transactionId, mono: true },
                      { label: 'Date',           value: fmtDate(paymentRecord.paymentDate || paymentRecord.coverageStart) },
                      { label: 'Time',           value: new Date(paymentRecord.paymentDate || paymentRecord.coverageStart).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
                      { label: 'Premium Paid',   value: fmt(paymentRecord.premiumAmount), highlight: true },
                      { label: 'Plan',           value: PLAN_LABELS[paymentRecord.planName] ?? paymentRecord.planName },
                      { label: 'Coverage Start', value: fmtDate(paymentRecord.coverageStart) },
                      { label: 'Coverage Until', value: fmtDate(paymentRecord.coverageEnd) },
                      { label: 'Payment Method', value: 'IMPS Transfer' },
                      { label: 'Status',         value: 'SUCCESS', success: true },
                    ].map(({ label, value, mono, highlight, success }) => (
                      <div key={label} className="flex items-center justify-between px-4 py-2.5"
                        style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
                        <span className={`text-xs font-semibold ${
                          success   ? 'text-green-400' :
                          highlight ? 'text-white text-sm font-bold' :
                          mono      ? 'font-mono' : ''
                        }`}
                          style={{ color: success ? '#22C55E' : highlight ? '#FFFFFF' : '#E2E8F0' }}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2.5">
                  {/* Download */}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const lines = [
                        'DELIVERGUARD AI — PAYMENT RECEIPT',
                        '===================================',
                        `Transaction ID : ${paymentRecord.transactionId}`,
                        `Date           : ${fmtDate(paymentRecord.coverageStart)}`,
                        `Premium Paid   : ${fmt(paymentRecord.premiumAmount)}`,
                        `Plan           : ${PLAN_LABELS[paymentRecord.planName] ?? paymentRecord.planName}`,
                        `Coverage Start : ${fmtDate(paymentRecord.coverageStart)}`,
                        `Coverage Until : ${fmtDate(paymentRecord.coverageEnd)}`,
                        `Payment Method : IMPS Transfer`,
                        `Status         : SUCCESS`,
                        '===================================',
                      ].join('\n');
                      const blob = new Blob([lines], { type: 'text/plain' });
                      const url  = URL.createObjectURL(blob);
                      const a    = document.createElement('a');
                      a.href = url; a.download = `receipt-${paymentRecord.transactionId}.txt`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    Download Receipt
                  </motion.button>

                  {/* View History */}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/insurance-payment-history')}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    View Payment History
                  </motion.button>

                  {/* Dashboard */}
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Return to Dashboard
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
