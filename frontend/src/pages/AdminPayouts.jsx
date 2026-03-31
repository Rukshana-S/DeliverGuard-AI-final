import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';

const STATUS_BADGE = {
  pending:    'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  success:    'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
};

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    api.get('/admin/payouts')
      .then((r) => setPayouts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totals = {
    total:   payouts.reduce((s, p) => s + p.amount, 0),
    success: payouts.filter((p) => p.paymentStatus === 'success').reduce((s, p) => s + p.amount, 0),
    pending: payouts.filter((p) => p.paymentStatus === 'pending').length,
    failed:  payouts.filter((p) => p.paymentStatus === 'failed').length,
  };

  const filtered = filter === 'all' ? payouts : payouts.filter((p) => p.paymentStatus === filter);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Disbursed',  value: formatCurrency(totals.total),   color: 'text-blue-600' },
          { label: 'Successful',       value: formatCurrency(totals.success),  color: 'text-green-600' },
          { label: 'Pending',          value: totals.pending,                  color: 'text-yellow-600' },
          { label: 'Failed',           value: totals.failed,                   color: 'text-red-600' },
        ].map((c) => (
          <div key={c.label} className="card text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center gap-3 mb-4">
          {['all', 'pending', 'processing', 'success', 'failed'].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No payouts found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Transaction ID</th>
                <th className="pb-3 pr-4">Worker</th>
                <th className="pb-3 pr-4">Bank</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Disruption</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{p._id.slice(-10).toUpperCase()}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{p.userId?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{p.userId?.city}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <p>{p.bankSnapshot?.bankName || p.userId?.bankAccount?.bankName || '—'}</p>
                    <p className="text-xs text-gray-400">
                      {p.bankSnapshot?.accountNumber
                        ? `****${p.bankSnapshot.accountNumber.slice(-4)}`
                        : '—'}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-semibold text-green-600">{formatCurrency(p.amount)}</td>
                  <td className="py-3 pr-4 capitalize text-xs">
                    {p.claimId?.disruptionType?.replace(/_/g, ' ') || '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[p.paymentStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-500">{formatDate(p.timestamp)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
