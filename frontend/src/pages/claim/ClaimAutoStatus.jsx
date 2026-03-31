import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getClaimById } from '../../services/claimService';
import { formatCurrency } from '../../utils/helpers';
import { Zap, MapPin, Calculator, CheckCircle, Banknote, Check } from 'lucide-react';

const STEPS = [
  { label: 'Disruption Detected',   Icon: Zap },
  { label: 'Location Verified',     Icon: MapPin },
  { label: 'Income Loss Calculated',Icon: Calculator },
  { label: 'Claim Approval',        Icon: CheckCircle },
  { label: 'Payout Initiation',     Icon: Banknote },
];

export default function ClaimAutoStatus() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const claimId = state?.claimId;

  const [claim,   setClaim]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!claimId) { setError('No claim ID found.'); setLoading(false); return; }
    getClaimById(claimId)
      .then((r) => setClaim(r.data))
      .catch(() => setError('Failed to load claim details.'))
      .finally(() => setLoading(false));
  }, [claimId]);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !claim) return (
    <div className="max-w-lg mx-auto space-y-4">
      <ClaimStepper />
      <div className="card text-center py-10 text-red-500">{error || 'Claim not found.'}</div>
      <button onClick={() => navigate('/claims')} className="btn-secondary w-full">View All Claims</button>
    </div>
  );

  // Map claim status to pipeline step index
  const statusStep = { pending: 1, approved: 3, paid: 4, investigating: 2, rejected: 1 };
  const currentStep = statusStep[claim.status] ?? 1;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <ClaimStepper />
      <div className="card">
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-6">Auto-Claim Pipeline</h2>
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const done   = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={step.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: done || active ? 1 : 0.85 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : active
                        ? 'bg-green-500 border-green-500 text-white ring-4 ring-green-100 dark:ring-green-900'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                    }`}
                  >
                    {done ? <Check size={16} /> : <step.Icon size={16} />}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 ${done ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
                <div className="pb-8 pt-2">
                  <p className={`font-medium text-sm ${done || active ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}`}>
                    {step.label}
                  </p>
                  {i === 2 && (done || active) && (
                    <span className="text-xs text-green-600 font-medium mt-0.5 block">
                      Estimated Compensation: {formatCurrency(claim.claimAmount)}
                    </span>
                  )}
                  {active && claim.status === 'investigating' && (
                    <span className="text-xs text-purple-500 mt-0.5 block">Under fraud review…</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Claim summary */}
      <div className="card space-y-2 text-sm">
        {[
          ['Claim ID',       claim._id.slice(-10)],
          ['Disruption',     claim.disruptionType?.replace(/_/g, ' ')],
          ['Location',       claim.location?.city || '—'],
          ['Income Loss',    formatCurrency(claim.incomeLoss)],
          ['Claim Amount',   formatCurrency(claim.claimAmount)],
          ['Status',         claim.status],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium capitalize text-gray-800 dark:text-gray-100">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/claim/verification', { state: { claimId: claim._id } })}
        className="btn-primary w-full py-3 text-base"
      >
        Continue to Verification →
      </button>
    </div>
  );
}
