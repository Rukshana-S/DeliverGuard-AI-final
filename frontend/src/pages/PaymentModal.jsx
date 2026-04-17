import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentModal({ show, onClose, premium, weeklyIncome, preview, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Razorpay SDK failed to load.');

      const { data } = await api.post('/payments/create-order', { weeklyIncome: Number(weeklyIncome) });

      const options = {
        key: data.keyId,
        amount: data.amount * 100,
        currency: data.currency,
        name: 'DeliverGuard AI',
        description: 'Weekly Insurance Premium',
        order_id: data.orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#4F46E5' },
        handler: async (response) => {
          try {
            const { data: payment } = await api.post('/payments/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              weeklyIncome: Number(weeklyIncome),
              ocrImageUrl: preview || '',
            });
            onSuccess(payment);
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description || 'Payment failed.');
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const handleClose = () => { setError(''); onClose(); };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <ShieldCheck size={15} className="text-blue-400" />
                </div>
                <p className="text-white font-semibold text-sm">Confirm Payment</p>
              </div>
              <button onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X size={14} className="text-gray-300" />
              </button>
            </div>

            <div className="px-6 pb-6 space-y-5 pt-4">
              <div className="text-center py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-gray-400 text-xs mb-1">Paying</p>
                <p className="text-4xl font-extrabold text-white">{fmt(premium)}</p>
                <p className="text-gray-400 text-xs mt-1">Weekly Insurance Premium</p>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs text-center">{error}
                </motion.p>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: loading ? '#2563eb99' : 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Opening Razorpay…</>
                ) : (
                  <><ShieldCheck size={16} /> Pay with Razorpay</>
                )}
              </motion.button>

              <p className="text-center text-xs text-gray-500">🔒 Secured by Razorpay · DeliverGuard AI</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
