import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [premium,  setPremium]  = useState('all');

  const fetchPolicies = (prem = 'all') => {
    setLoading(true);
    const url = prem === 'all' ? '/admin/policies' : `/admin/policies?premium=${prem}`;
    api.get(url)
      .then((r) => setPolicies(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPolicies(); }, []);

  const handlePremiumChange = (val) => {
    setPremium(val);
    fetchPolicies(val);
  };

  const handleBlock = async (userId) => {
    try {
      await api.put(`/admin/block-user/${userId}`);
      setPolicies((prev) => prev.map((p) =>
        p.userId?._id === userId ? { ...p, userId: { ...p.userId, isBlocked: true } } : p
      ));
    } catch { alert('Failed to block user'); }
  };

  const handleUnblock = async (userId) => {
    try {
      await api.put(`/admin/unblock-user/${userId}`);
      setPolicies((prev) => prev.map((p) =>
        p.userId?._id === userId ? { ...p, userId: { ...p.userId, isBlocked: false } } : p
      ));
    } catch { alert('Failed to unblock user'); }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="card flex items-center gap-3">
        <label className="text-sm text-gray-500 font-medium">Filter by Premium:</label>
        <select
          value={premium}
          onChange={(e) => handlePremiumChange(e.target.value)}
          className="input w-36"
        >
          <option value="all">All</option>
          <option value="5">5%</option>
          <option value="8">8%</option>
          <option value="10">10%</option>
        </select>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : policies.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No policies found</p>
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
                <tr key={p._id} className="border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{p.userId?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{p.userId?.city}</p>
                    {p.userId?.isBlocked && (
                      <span className="text-xs text-red-500 font-semibold">Blocked</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 capitalize font-medium">{p.planType}</td>
                  <td className="py-3 pr-4">{p.premiumPct ?? p.weeklyPremium}% of income</td>
                  <td className="py-3 pr-4">{formatCurrency(p.maxWeeklyPayout ?? p.coverageAmount)}</td>
                  <td className="py-3 pr-4">{formatDate(p.startDate)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {p.userId && (
                      p.userId.isBlocked ? (
                        <button
                          onClick={() => handleUnblock(p.userId._id)}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBlock(p.userId._id)}
                          className="text-xs font-semibold px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Block
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
