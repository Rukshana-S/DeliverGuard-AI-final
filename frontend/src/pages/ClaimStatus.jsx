import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Zap, MapPin, Calculator, CheckCircle, Banknote, Check, Wallet } from 'lucide-react';

const STEPS = [
  { key: 'detected',   label: 'Disruption Detected',    Icon: Zap },
  { key: 'verified',   label: 'Location Verified',       Icon: MapPin },
  { key: 'calculated', label: 'Income Loss Calculated',  Icon: Calculator },
  { key: 'approved',   label: 'Claim Approved',          Icon: CheckCircle },
  { key: 'paid',       label: 'Payout Initiated',        Icon: Banknote },
];

const STATUS_STEP = {
  pending: 1,
  approved: 3,
  paid: 4,
  rejected: 1,
  investigating: 2,
};

export default function ClaimStatus() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/claims/${id}`)
      .then((r) => setClaim(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!claim) return (
    <div className="card text-center py-12">
      <p className="text-gray-400">Claim not found.</p>
      <button onClick={() => navigate('/claims')} className="btn-primary mt-4">Back to Claims</button>
    </div>
  );

  const currentStep = STATUS_STEP[claim.status] ?? 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Claim ID</p>
            <p className="font-mono text-sm font-semibold">{claim._id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
            claim.status === 'paid' ? 'bg-green-100 text-green-700' :
            claim.status === 'approved' ? 'bg-blue-100 text-blue-700' :
            claim.status === 'rejected' ? 'bg-red-100 text-red-700' :
            claim.status === 'investigating' ? 'bg-purple-100 text-purple-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>{claim.status}</span>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <p className="text-xs text-gray-400">Disruption</p>
            <p className="text-sm font-medium capitalize mt-0.5">{claim.disruptionType?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Location</p>
            <p className="text-sm font-medium mt-0.5">{claim.location?.city || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-medium mt-0.5">{formatDate(claim.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-6">Claim Processing Timeline</h3>
        <div className="space-y-0">
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: done ? 1 : 0.8 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? 'bg-blue-600 border-blue-600 text-white' :
                      'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                    } ${active ? 'ring-4 ring-blue-100 dark:ring-blue-900' : ''}`}
                  >
                    {done ? <Check size={16} /> : <step.Icon size={16} />}
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-0.5 h-10 mt-1 ${done ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
                <div className="pb-8 pt-2">
                  <p className={`font-medium text-sm ${done ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}`}>{step.label}</p>
                  {active && claim.status !== 'rejected' && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-blue-500 mt-0.5">In progress...</motion.p>
                  )}
                  {i === 2 && done && (
                    <p className="text-xs text-gray-500 mt-0.5">Income loss: {formatCurrency(claim.incomeLoss)}</p>
                  )}
                  {i === 4 && done && (
                    <p className="text-xs text-green-600 font-semibold mt-0.5">Payout: {formatCurrency(claim.claimAmount)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payout summary */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estimated Payout</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{formatCurrency(claim.claimAmount)}</p>
          </div>
          <Wallet size={32} className="text-blue-600" />
        </div>
        {claim.status === 'approved' && (
          <button onClick={() => navigate(`/payout/${claim._id}`)} className="btn-primary w-full mt-4">
            Initiate Payout →
          </button>
        )}
        {claim.status === 'paid' && (
          <button onClick={() => navigate(`/payout/${claim._id}`)} className="btn-secondary w-full mt-4">
            View Receipt
          </button>
        )}
      </div>

      <button onClick={() => navigate('/claims')} className="btn-secondary w-full">← Back to Claims</button>
    </div>
  );
}
