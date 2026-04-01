import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const fmtAmt  = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); } catch { return '—'; } };
const fmtTime = (d) => { try { return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); } catch { return '—'; } };

export default function ClaimSuccess() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { user }  = useAuth();

  const claimAmount = Number(state?.claimAmount) || Number(state?.amount) || 0;
  const claimId     = state?.claimId || '';
  const now         = new Date().toISOString();
  const bank        = user?.bankAccount?.bankName || 'SBI';
  const masked      = user?.bankAccount?.accountNumber?.slice(-4) || '0000';
  const txnId       = `TXN-${claimId.slice(-8).toUpperCase() || Date.now()}`;

  const handleDownload = () => {
    const lines = [
      'DELIVERGUARD AI — CLAIM PAYOUT RECEIPT',
      '========================================',
      `Transaction ID : ${txnId}`,
      `Date           : ${fmtDate(now)}`,
      `Time           : ${fmtTime(now)}`,
      `Amount Credited: ${fmtAmt(claimAmount)}`,
      `Bank           : ${bank}`,
      `Account        : ****${masked}`,
      `Payment Method : IMPS Transfer`,
      `Status         : SUCCESS`,
      '========================================',
      'Thank you for using DeliverGuard AI.',
    ].join('\n');
    const blob = new Blob([lines], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `payout-${claimId.slice(-8) || 'dg'}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 py-8 overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #0B0F1A 0%, #121826 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 0 60px rgba(34,197,94,0.08), 0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top green accent */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }} />

        <div className="px-6 py-8 space-y-6">

          {/* Icon + Amount */}
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 32px rgba(34,197,94,0.4)' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
              <h1 className="text-4xl font-extrabold text-white">{fmtAmt(claimAmount)} Credited</h1>
              <p className="text-sm mt-2" style={{ color: '#94A3B8' }}>Automatically transferred to your bank account</p>
            </motion.div>
          </div>

          {/* Receipt */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#64748B' }}>Transaction Receipt</p>
            </div>
            {[
              { label: 'Transaction ID', value: txnId,              mono: true },
              { label: 'Date',           value: fmtDate(now) },
              { label: 'Time',           value: fmtTime(now) },
              { label: 'Amount',         value: fmtAmt(claimAmount), highlight: true },
              { label: 'Bank',           value: bank },
              { label: 'Account',        value: `****${masked}` },
              { label: 'Payment Method', value: 'IMPS Transfer' },
              { label: 'Status',         value: 'SUCCESS',           success: true },
            ].map(({ label, value, mono, highlight, success }, i, arr) => (
              <div key={label} className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
                <span className={`text-xs font-semibold ${mono ? 'font-mono' : ''}`}
                  style={{ color: success ? '#22C55E' : highlight ? '#FFFFFF' : '#E2E8F0', fontSize: highlight ? '13px' : undefined }}>
                  {value}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-2.5">
            <button onClick={handleDownload}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', background: 'rgba(255,255,255,0.04)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Receipt
            </button>

            <button onClick={() => navigate('/claims')}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/10"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#E2E8F0', background: 'rgba(255,255,255,0.04)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Claims &amp; Payouts
            </button>

            <button onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}>
              Return to Dashboard
            </button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
