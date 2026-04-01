import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolicy } from '../context/PolicyContext';
import { payWeeklyPremium } from '../services/premiumService';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PLAN_RATES  = { basic: 5, standard: 8, premium: 10 };
const PLAN_LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const STEPS       = ['upload', 'scanning', 'confirm', 'payment', 'success'];

const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function UploadSalaryProof() {
  const { policy } = usePolicy();
  const navigate   = useNavigate();
  const fileRef    = useRef();

  const [step,          setStep]          = useState('upload');
  const [file,          setFile]          = useState(null);
  const [preview,       setPreview]       = useState(null);
  const [weeklyIncome,  setWeeklyIncome]  = useState('');
  const [manualMode,    setManualMode]    = useState(false);
  const [error,         setError]         = useState('');
  const [paying,        setPaying]        = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [password,      setPassword]      = useState('');
  const [verifying,     setVerifying]     = useState(false);

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

  const handlePay = async () => {
    if (!weeklyIncome || Number(weeklyIncome) <= 0) {
      setError('Please enter a valid weekly income.');
      return;
    }
    if (!policy) {
      setError('No active insurance plan found. Please select a plan first.');
      return;
    }
    // Go to password verification step first
    setStep('payment');
    setError('');
  };

  const handleVerifyAndPay = async () => {
    if (!password) { setError('Please enter your password.'); return; }
    setVerifying(true);
    setError('');
    try {
      await api.post('/payments/verify-password', { password });
    } catch {
      setError('Incorrect password. Please try again.');
      setVerifying(false);
      return;
    }
    setPaying(true);
    try {
      const { data } = await payWeeklyPremium({
        weeklyIncome: Number(weeklyIncome),
        ocrImageUrl:  preview || '',
      });
      setPaymentRecord(data);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Upload Weekly Income Proof</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload a screenshot showing your salary credited to your bank account for last week.
        </p>
      </div>

      {/* Step indicator */}
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
                disabled={paying || !weeklyIncome || Number(weeklyIncome) <= 0 || !policy}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700
                  disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400
                  disabled:cursor-not-allowed transition-colors"
              >
                {paying ? 'Processing…' : `Pay ${fmt(premium)}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: GPay-like Password Verification ── */}
        {step === 'payment' && (
          <motion.div key="payment"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-4">
            <div className="card text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto text-3xl">
                🔐
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-100 text-lg">Confirm Payment</p>
                <p className="text-sm text-gray-500 mt-1">Enter your DeliverGuard password to authorize</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-left space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-extrabold text-blue-600 text-lg">{fmt(premium)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{PLAN_LABELS[planKey]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">7 Days</span>
                </div>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="input text-center text-lg tracking-widest"
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setStep('confirm'); setError(''); setPassword(''); }}
                className="flex-1 py-3 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Back
              </button>
              <button onClick={handleVerifyAndPay} disabled={verifying || paying || !password}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                {verifying || paying ? 'Processing…' : `Pay ${fmt(premium)}`}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 5: Success ── */}}
        {step === 'success' && paymentRecord && (
          <motion.div key="success"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card text-center space-y-5 py-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-6xl"
            >
              ✅
            </motion.div>
            <div>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">Payment Successful!</p>
              <p className="text-sm text-gray-500 mt-1">Your coverage is now active for 7 days.</p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-left space-y-2">
              {[
                { label: 'Transaction ID', value: paymentRecord.transactionId },
                { label: 'Plan',           value: PLAN_LABELS[paymentRecord.planName] ?? paymentRecord.planName },
                { label: 'Premium Paid',   value: fmt(paymentRecord.premiumAmount) },
                { label: 'Coverage Start', value: fmtDate(paymentRecord.coverageStart) },
                { label: 'Coverage Until', value: fmtDate(paymentRecord.coverageEnd) },
                { label: 'Grace Deadline', value: fmtDate(paymentRecord.graceDeadline) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/insurance-payment-history')}
                className="flex-1 py-3 rounded-2xl font-semibold border border-gray-200 dark:border-gray-700
                  text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                View History
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 rounded-2xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
