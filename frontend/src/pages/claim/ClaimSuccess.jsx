import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { CheckCircle, Download } from 'lucide-react';

export default function ClaimSuccess() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const payout    = state?.payout  || {};
  const claimId   = state?.claimId || '';

  const handleDownload = () => {
    const content = [
      'DELIVERGUARD AI — PAYOUT RECEIPT',
      '==================================',
      `Transaction ID : ${payout.razorpayId || payout._id || '—'}`,
      `Date & Time    : ${formatDate(payout.timestamp || payout.createdAt)}`,
      `Amount Credited: ${formatCurrency(payout.amount)}`,
      `Payment Method : IMPS Transfer`,
      `Claim ID       : ${claimId}`,
      `Status         : ${payout.paymentStatus?.toUpperCase() || 'SUCCESS'}`,
      '==================================',
      'Thank you for using DeliverGuard AI.',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `receipt-${claimId.slice(-8) || 'dg'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-lg mx-auto">
      <ClaimStepper />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card text-center py-10 space-y-5"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle size={40} className="text-green-600" />
        </motion.div>

        <div>
          <h2 className="text-3xl font-bold text-green-700 dark:text-green-400">
            {formatCurrency(payout.amount)} Credited
          </h2>
          <p className="text-gray-500 text-sm mt-1">Successfully transferred to your bank account.</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-5 text-left space-y-3">
          {[
            ['Transaction ID',  payout.razorpayId || payout._id?.slice(-12) || '—'],
            ['Date & Time',     formatDate(payout.timestamp || payout.createdAt)],
            ['Amount',          formatCurrency(payout.amount)],
            ['Payment Method',  'IMPS Transfer'],
            ['Status',          payout.paymentStatus?.toUpperCase() || 'SUCCESS'],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleDownload} className="btn-secondary flex-1 flex items-center justify-center gap-1.5">
            <Download size={14} /> Download Receipt
          </button>
          <button onClick={() => navigate('/claims')} className="btn-primary flex-1">
            View All Claims
          </button>
        </div>

        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full">
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
