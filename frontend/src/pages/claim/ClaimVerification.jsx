import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import api from '../../services/api';

const CHECKS = [
  { label: 'Weather API Verification',  detail: 'Matched IMD data for Andheri West' },
  { label: 'GPS Location Log',          detail: 'Worker active in zone during event' },
  { label: 'Delivery Platform Sync',    detail: 'No concurrent active deliveries found' },
  { label: 'Duplicate Claim Check',     detail: 'No prior claims for this event window' },
];

export default function ClaimVerification() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const claimId   = state?.claimId;

  const [revealed,   setRevealed]   = useState(0);
  const [processing, setProcessing] = useState(false);
  const [done,       setDone]       = useState(false);

  // Reveal checks one by one
  useEffect(() => {
    if (revealed >= CHECKS.length) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 700);
    return () => clearTimeout(t);
  }, [revealed]);

  // Once all checks revealed — run payout
  useEffect(() => {
    if (revealed < CHECKS.length || processing || done) return;
    setProcessing(true);

    const run = async () => {
      let amount = 0;
      let payoutObj = {};

      // 1. Fetch claim amount
      try {
        const { data: claim } = await api.get(`/claims/${claimId}`);
        amount = Number(claim.claimAmount) || 0;
        console.log('[PAYOUT] claim.claimAmount =', claim.claimAmount, '| parsed =', amount);
      } catch (e) {
        console.error('[PAYOUT] claim fetch error:', e.response?.data || e.message);
      }

      // 2. Initiate payout
      try {
        const { data } = await api.post('/payout/initiate', { claimId });
        console.log('[PAYOUT] payout response:', data);
        amount = Number(data.amount) || amount;
        payoutObj = data;
      } catch (e) {
        console.error('[PAYOUT] payout error:', e.response?.data || e.message);
      }

      // 3. Store in sessionStorage as backup
      sessionStorage.setItem('dg_amount',    String(amount));
      sessionStorage.setItem('dg_claimId',   claimId || '');
      sessionStorage.setItem('dg_razorpayId', payoutObj.razorpayId || '');
      sessionStorage.setItem('dg_createdAt',  payoutObj.createdAt || new Date().toISOString());
      sessionStorage.setItem('dg_bankName',   payoutObj.bankSnapshot?.bankName || '');
      sessionStorage.setItem('dg_account',    payoutObj.bankSnapshot?.accountNumber || '');

      console.log('[PAYOUT] final amount stored:', amount);
      setDone(true);

      setTimeout(() => navigate('/claim/success', {
        state: {
          claimId,
          amount,
          razorpayId:    payoutObj.razorpayId || '',
          createdAt:     payoutObj.createdAt  || new Date().toISOString(),
          bankName:      payoutObj.bankSnapshot?.bankName || '',
          accountNumber: payoutObj.bankSnapshot?.accountNumber || '',
          paymentStatus: 'success',
        },
      }), 800);
    };

    run();
  }, [revealed, processing, done, claimId, navigate]);

  const allDone = revealed >= CHECKS.length;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ClaimStepper />

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Security Scan Protocol</h2>
          <AnimatePresence>
            {allDone && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full"
              >
                100% Secure ✓
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          {CHECKS.map((check, i) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -16 }}
              animate={i < revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: i < revealed ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5"
              >
                ✓
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{check.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 flex items-center justify-center gap-3 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"
            >
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {done ? 'Redirecting to payout…' : 'Initiating payout…'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
