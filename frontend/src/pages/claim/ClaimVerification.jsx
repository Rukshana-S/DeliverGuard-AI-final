import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';

const CHECKS = [
  { label: 'Weather API Verification', detail: 'Matched IMD data for Andheri West' },
  { label: 'GPS Location Log', detail: 'Worker active in zone during event' },
  { label: 'Delivery Platform Sync', detail: 'No concurrent active deliveries found' },
  { label: 'Duplicate Claim Check', detail: 'No prior claims for this event window' },
];

export default function ClaimVerification() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const claimId = state?.claimId;
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= CHECKS.length) return;
    const t = setTimeout(() => setRevealed((p) => p + 1), 600);
    return () => clearTimeout(t);
  }, [revealed]);

  const allDone = revealed >= CHECKS.length;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ClaimStepper />
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">Security Scan Protocol</h2>
          {allDone && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full"
            >
              100% Secure ✓
            </motion.span>
          )}
        </div>

        <div className="space-y-3">
          {CHECKS.map((check, i) => (
            <motion.div
              key={check.label}
              initial={{ opacity: 0, x: -16 }}
              animate={i < revealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                i < revealed ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {i < revealed ? '✓' : '·'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{check.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: allDone ? 1 : 0.4 }}
        disabled={!allDone}
        onClick={() => navigate('/claim/approval', { state: { claimId } })}
        className="btn-primary w-full py-3 text-base disabled:cursor-not-allowed"
      >
        Proceed to Payout →
      </motion.button>
    </div>
  );
}
