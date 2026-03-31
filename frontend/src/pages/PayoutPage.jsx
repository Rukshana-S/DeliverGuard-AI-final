import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';
import { CheckCircle, Download } from 'lucide-react';

export default function PayoutPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [claimRes, payoutRes] = await Promise.allSettled([
          api.get(`/claims/${claimId}`),
          api.get(`/payout/status/${claimId}`),
        ]);
        if (claimRes.status === 'fulfilled') setClaim(claimRes.value.data);
        if (payoutRes.status === 'fulfilled') setPayout(payoutRes.value.data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [claimId]);

  const handlePayout = async () => {
    setInitiating(true);
    setError('');
    try {
      const res = await api.post('/payout/initiate', { claimId });
      setPayout(res.data);
      setClaim((prev) => ({ ...prev, status: 'paid' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Payout failed. Please try again.');
    } finally {
      setInitiating(false);
    }
  };

  const handleDownload = () => {
    const content = `
DELIVERGUARD AI — PAYOUT RECEIPT
==================================
Transaction ID : ${payout?.razorpayId || payout?._id}
Date & Time    : ${formatDate(payout?.timestamp || payout?.createdAt)}
Amount Credited: ${formatCurrency(payout?.amount)}
Payment Method : IMPS Transfer
Disruption     : ${claim?.disruptionType?.replace(/_/g, ' ')}
Location       : ${claim?.location?.city || '—'}
Status         : ${payout?.paymentStatus?.toUpperCase()}
==================================
Thank you for using DeliverGuard AI.
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payout?._id?.slice(-8) || 'dg'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isPaid = payout?.paymentStatus === 'success' || claim?.status === 'paid';

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {isPaid ? (
        /* Success screen */
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Payout Successful!</h2>
          <p className="text-gray-500 text-sm mt-1">Amount has been transferred to your bank account.</p>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 mt-6 text-left space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount Credited</span>
              <span className="font-bold text-green-700 text-lg">{formatCurrency(payout?.amount || claim?.claimAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-xs">{payout?.razorpayId || payout?._id?.slice(-12) || '—'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date & Time</span>
              <span>{formatDate(payout?.timestamp || payout?.createdAt)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Method</span>
              <span>IMPS Transfer</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Disruption Event</span>
              <span className="capitalize">{claim?.disruptionType?.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleDownload} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
              <Download size={14} /> Download Receipt
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-primary flex-1">Go to Dashboard</button>
          </div>
        </motion.div>
      ) : (
        /* Initiate payout screen */
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Initiate Payout</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Claim Amount</span>
                <span className="font-bold text-blue-600 text-lg">{formatCurrency(claim?.claimAmount)}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500">Disruption Type</span>
                <span className="capitalize">{claim?.disruptionType?.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-gray-500">Transfer Method</span>
                <span>IMPS (Instant)</span>
              </div>
            </div>
          </div>

          <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Transfer Progress</p>
            <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2 mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: initiating ? '70%' : '30%' }}
                transition={{ duration: 1.5 }}
                className="bg-blue-600 h-2 rounded-full"
              />
            </div>
            <p className="text-xs text-blue-500 mt-2">{initiating ? 'Processing transfer...' : 'Ready to transfer'}</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3">{error}</div>}

          <button onClick={handlePayout} disabled={initiating || claim?.status !== 'approved'} className="btn-primary w-full py-3 text-base">
            {initiating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : 'Transfer to Bank Now'}
          </button>
          {claim?.status !== 'approved' && (
            <p className="text-xs text-center text-gray-400">Payout available only for approved claims.</p>
          )}
        </div>
      )}
    </div>
  );
}
