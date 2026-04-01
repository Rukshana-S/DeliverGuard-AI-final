import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getClaimById } from '../../services/claimService';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import { Banknote } from 'lucide-react';

export default function ClaimApproval() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const claimId   = state?.claimId;

  const [claim,   setClaim]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!claimId) { setLoading(false); return; }
    getClaimById(claimId)
      .then((r) => setClaim(r.data))
      .catch(() => setError('Failed to load claim.'))
      .finally(() => setLoading(false));
  }, [claimId]);

  // Auto-initiate payout — no password needed for claims
  const handlePayout = async () => {
    setPaying(true);
    setError('');
    try {
      const { data: payout } = await api.post('/payout/initiate', { claimId });
      navigate('/claim/success', { state: { claimId, payout } });
    } catch (err) {
      setError(err.response?.data?.message || 'Payout failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />

      {/* Approved amount */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800"
      >
        <p className="text-sm text-gray-500 mb-1">Approved Claim Amount</p>
        <p className="text-5xl font-bold text-blue-700 dark:text-blue-300">
          {claim ? formatCurrency(claim.claimAmount) : '—'}
        </p>
        {claim?.hourlyIncome && (
          <p className="text-xs text-gray-400 mt-2">
            Hourly Income: {formatCurrency(claim.hourlyIncome)} × 6 hrs
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">Claim ID: …{claimId?.slice(-8)}</p>
        <p className="text-xs text-gray-400 capitalize mt-1">
          {claim?.disruptionType?.replace(/_/g, ' ')} · {claim?.location?.city}
        </p>
      </motion.div>

      {/* Transfer progress */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>DeliverGuard Escrow</span>
          <span>Your Bank Account</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: paying ? '90%' : '50%' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full"
          />
        </div>
        <p className="text-xs text-blue-500 mt-2 text-center">
          {paying ? 'Processing transfer…' : 'Transfer ready — click below to receive payout'}
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        onClick={handlePayout}
        disabled={paying || !claim || claim.status === 'paid'}
        className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {paying ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          <><Banknote size={18} /> Transfer to Bank Now</>
        )}
      </motion.button>
    </div>
  );
}
