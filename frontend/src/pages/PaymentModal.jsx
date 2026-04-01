import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { payWeeklyPremium } from '../services/premiumService';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function PaymentModal({ show, onClose, premium, weeklyIncome, preview, onSuccess }) {
  const [password,  setPassword]  = useState('');
  const [error,     setError]     = useState('');
  const [verifying, setVerifying] = useState(false);

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
    try {
      const { data } = await payWeeklyPremium({
        weeklyIncome: Number(weeklyIncome),
        ocrImageUrl:  preview || '',
      });
      setPassword('');
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(145deg, #1a1f2e, #0f1420)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Lock size={15} className="text-blue-400" />
                </div>
                <p className="text-white font-semibold text-sm">Enter Account Password</p>
              </div>
              <button onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={14} className="text-gray-300" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5 pt-4">
              {/* Amount display */}
              <div className="text-center py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-xs mb-1">Paying</p>
                <p className="text-4xl font-extrabold text-white">{fmt(premium)}</p>
                <p className="text-gray-400 text-xs mt-1">Weekly Insurance Premium</p>
              </div>

              {/* Password input */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium">Enter your login password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyAndPay()}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl text-white text-center text-lg tracking-widest
                    border border-white/10 focus:outline-none focus:border-blue-500 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                />
                {error && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs text-center">{error}
                  </motion.p>
                )}
              </div>

              {/* Verify button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleVerifyAndPay}
                disabled={verifying || !password}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: verifying ? '#2563eb99' : 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
              >
                {verifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying…
                  </>
                ) : (
                  <><ShieldCheck size={16} /> Verify & Pay</>
                )}
              </motion.button>

              <p className="text-center text-xs text-gray-500">
                🔒 Secured by DeliverGuard AI
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
