import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/policies').then((r) => setPolicies(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/admin/claims/${id}`, { status });
      setPolicies((prev) => prev.map((p) => (p._id === id ? { ...p, status } : p)));
    } catch {
      alert('Failed to update policy');
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
              <th className="pb-3 pr-4">Plan</th>
              <th className="pb-3 pr-4">Premium</th>
              <th className="pb-3 pr-4">Coverage</th>
              <th className="pb-3 pr-4">Start Date</th>
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                <td className="py-3 pr-4">{p.userId?.name || '—'}<br /><span className="text-xs text-gray-400">{p.userId?.city}</span></td>
                <td className="py-3 pr-4 capitalize font-medium">{p.planType}</td>
                <td className="py-3 pr-4">{p.premiumPct ?? p.weeklyPremium}% of income</td>
                <td className="py-3 pr-4">{formatCurrency(p.maxWeeklyPayout ?? p.coverageAmount)}</td>
                <td className="py-3 pr-4">{formatDate(p.startDate)}</td>
                <td className="py-3 pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="py-3">
                  {p.status === 'active' && (
                    <button onClick={() => updateStatus(p._id, 'cancelled')} className="text-xs text-red-600 hover:underline">Suspend</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
