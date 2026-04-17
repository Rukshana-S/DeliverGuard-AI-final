import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClaims } from '../services/claimService';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';
import { motion } from 'framer-motion';
import { Download, Inbox } from 'lucide-react';

export default function Claims() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClaims().then((r) => setClaims(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = claims.filter((c) => {
    const matchStatus = filter === 'all' || c.status === filter;
    const matchSearch = !search ||
      c.disruptionType?.toLowerCase().includes(search.toLowerCase()) ||
      c._id?.includes(search) ||
      c.location?.city?.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || new Date(c.createdAt) >= new Date(dateFrom);
    const matchTo = !dateTo || new Date(c.createdAt) <= new Date(dateTo + 'T23:59:59');
    return matchStatus && matchSearch && matchFrom && matchTo;
  });

  const exportCSV = () => {
    const header = 'Claim ID,Date,Disruption Type,Location,Income Loss,Claim Amount,Status';
    const rows = filtered.map((c) =>
      `${c._id},${formatDate(c.createdAt)},${c.disruptionType},${c.location?.city || ''},${c.incomeLoss},${c.claimAmount},${c.status}`
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claims-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalAmount = filtered.reduce((s, c) => s + c.claimAmount, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="text-xs text-gray-500 mb-1 block">Search</label>
            <input className="input" placeholder="Search by type, ID, city..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              {['all', 'pending', 'approved', 'paid', 'rejected'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input className="input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input className="input" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-1">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm text-gray-500">
        <span>{filtered.length} claims</span>
        <span>·</span>
        <span>Total: <strong className="text-gray-800 dark:text-gray-100">{formatCurrency(totalAmount)}</strong></span>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {loading ? (
          <div className="space-y-3 py-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Inbox size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-400">No claims found</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Claim ID</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Disruption</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <motion.tr
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="py-3 pr-4 font-mono text-xs text-gray-400">{c._id.slice(-8)}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatDate(c.createdAt)}</td>
                  <td className="py-3 pr-4 capitalize">{c.disruptionType?.replace(/_/g, ' ')}</td>
                  <td className="py-3 pr-4">{c.location?.city || '—'}</td>
                  <td className="py-3 pr-4 font-semibold">{formatCurrency(c.claimAmount)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(c.status)}`}>{c.status}</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => navigate(`/claims/${c._id}`)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View →
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
