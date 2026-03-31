import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';
import { motion } from 'framer-motion';

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/claims').then((r) => setClaims(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/claims/${id}`, { status });
      setClaims((prev) => prev.map((c) => (c._id === id ? data : c)));
    } catch {
      alert('Failed to update claim');
    }
  };

  return (
    <div className="card overflow-x-auto">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="pb-3 pr-4">Worker</th>
              <th className="pb-3 pr-4">Disruption</th>
              <th className="pb-3 pr-4">Location</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                <td className="py-3 pr-4">{c.userId?.name || '—'}</td>
                <td className="py-3 pr-4 capitalize">{c.disruptionType?.replace(/_/g, ' ')}</td>
                <td className="py-3 pr-4">{c.location?.city || '—'}</td>
                <td className="py-3 pr-4 font-semibold">{formatCurrency(c.claimAmount)}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(c.status)}`}>{c.status}</span>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    {c.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(c._id, 'approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                        <button onClick={() => updateStatus(c._id, 'rejected')} className="text-xs text-red-600 hover:underline">Reject</button>
                      </>
                    )}
                    {c.status === 'approved' && (
                      <button onClick={() => updateStatus(c._id, 'investigating')} className="text-xs text-purple-600 hover:underline">Investigate</button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
