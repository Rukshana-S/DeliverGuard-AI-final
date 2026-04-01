import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, getStatusBadge } from '../utils/helpers';
import { motion } from 'framer-motion';

export default function AdminClaims() {
  const [claims,  setClaims]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/claims')
      .then((r) => setClaims(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card overflow-x-auto">
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : claims.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No claims found</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
              <th className="pb-3 pr-4">Worker</th>
              <th className="pb-3 pr-4">Disruption</th>
              <th className="pb-3 pr-4">Location</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <motion.tr
                key={c._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <td className="py-3 pr-4">
                  <p className="font-medium">{c.userId?.name || '—'}</p>
                  <p className="text-xs text-gray-400">{c.userId?.city}</p>
                </td>
                <td className="py-3 pr-4 capitalize">{c.disruptionType?.replace(/_/g, ' ')}</td>
                <td className="py-3 pr-4">{c.location?.city || '—'}</td>
                <td className="py-3 pr-4 font-semibold">{formatCurrency(c.claimAmount)}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(c.status)}`}>
                    {c.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
