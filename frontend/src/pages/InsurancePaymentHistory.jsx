import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPaymentHistory } from '../services/premiumService';
import { useNavigate } from 'react-router-dom';

const PLAN_LABELS = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function coverageStatus(p) {
  const now = new Date();
  if (now <= new Date(p.coverageEnd)) return { label: 'Active',      cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' };
  if (now <= new Date(p.graceDeadline)) return { label: 'Grace Period', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  return { label: 'Expired', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
}

function downloadReceipt(p) {
  const lines = [
    'DeliverGuard AI — Payment Receipt',
    '─────────────────────────────────',
    `Transaction ID : ${p.transactionId}`,
    `Plan           : ${PLAN_LABELS[p.planName] ?? p.planName}`,
    `Weekly Income  : ${fmt(p.weeklyIncome)}`,
    `Premium Rate   : ${p.premiumPercentage}%`,
    `Premium Paid   : ${fmt(p.premiumAmount)}`,
    `Payment Date   : ${fmtDate(p.paymentDate)}`,
    `Coverage Start : ${fmtDate(p.coverageStart)}`,
    `Coverage End   : ${fmtDate(p.coverageEnd)}`,
    `Grace Deadline : ${fmtDate(p.graceDeadline)}`,
    `Status         : ${p.paymentStatus}`,
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `receipt-${p.transactionId}.txt`;
  a.click();
}

export default function InsurancePaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getPaymentHistory()
      .then((r) => setPayments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Insurance Payment History</h2>
          <p className="text-sm text-gray-500 mt-0.5">All weekly premium payments and coverage periods</p>
        </div>
        <button
          onClick={() => navigate('/upload-salary-proof')}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          + Pay Premium
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="text-5xl">💳</div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">No payments yet</p>
          <p className="text-sm text-gray-400">Upload your salary proof to pay your first weekly premium.</p>
          <button onClick={() => navigate('/upload-salary-proof')}
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
            Upload Salary Screenshot
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  {['Date', 'Weekly Income', 'Premium Paid', 'Plan', 'Coverage Until', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="pb-3 pr-4 last:pr-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payments.map((p, i) => {
                  const status = coverageStatus(p);
                  return (
                    <motion.tr key={p._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{fmtDate(p.paymentDate)}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800 dark:text-gray-100">{fmt(p.weeklyIncome)}</td>
                      <td className="py-3 pr-4 font-semibold text-blue-600 dark:text-blue-400">{fmt(p.premiumAmount)}</td>
                      <td className="py-3 pr-4 capitalize text-gray-700 dark:text-gray-300">{PLAN_LABELS[p.planName] ?? p.planName}</td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{fmtDate(p.coverageEnd)}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="py-3 flex gap-2">
                        <button onClick={() => downloadReceipt(p)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          📄 Receipt
                        </button>
                        <button onClick={() => setSelected(selected?._id === p._id ? null : p)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {payments.map((p) => {
              const status = coverageStatus(p);
              return (
                <div key={p._id} className="card space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{fmt(p.premiumAmount)} paid</p>
                      <p className="text-xs text-gray-400">{fmtDate(p.paymentDate)} · {PLAN_LABELS[p.planName] ?? p.planName}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Weekly Income</span>
                    <span className="font-medium">{fmt(p.weeklyIncome)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Coverage Until</span>
                    <span className="font-medium">{fmtDate(p.coverageEnd)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => downloadReceipt(p)}
                      className="flex-1 text-xs py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400">
                      📄 Receipt
                    </button>
                    <button onClick={() => setSelected(selected?._id === p._id ? null : p)}
                      className="flex-1 text-xs py-2 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="card border-2 border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold text-gray-800 dark:text-gray-100">Payment Details</p>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
              </div>
              {[
                { label: 'Transaction ID',  value: selected.transactionId },
                { label: 'Plan',            value: PLAN_LABELS[selected.planName] ?? selected.planName },
                { label: 'Weekly Income',   value: fmt(selected.weeklyIncome) },
                { label: 'Premium Rate',    value: `${selected.premiumPercentage}%` },
                { label: 'Premium Amount',  value: fmt(selected.premiumAmount) },
                { label: 'Payment Date',    value: fmtDate(selected.paymentDate) },
                { label: 'Coverage Start',  value: fmtDate(selected.coverageStart) },
                { label: 'Coverage End',    value: fmtDate(selected.coverageEnd) },
                { label: 'Grace Deadline',  value: fmtDate(selected.graceDeadline) },
                { label: 'Status',          value: selected.paymentStatus },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100 capitalize">{value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
