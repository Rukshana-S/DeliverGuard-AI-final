import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';

const STATUS_BADGE = (active) =>
  active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [city, setCity]       = useState('all');
  const [platform, setPlatform] = useState('all');

  const fetchUsers = () => {
    const params = {};
    if (search)              params.search   = search;
    if (city !== 'all')      params.city     = city;
    if (platform !== 'all')  params.platform = platform;
    setLoading(true);
    api.get('/admin/users', { params })
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, city, platform]); // eslint-disable-line

  const toggleStatus = async (id, active) => {
    try {
      const { data } = await api.patch(`/admin/users/${id}`, { action: active ? 'suspend' : 'activate' });
      setUsers((prev) => prev.map((u) => (u._id === id ? data : u)));
    } catch { alert('Failed to update worker'); }
  };

  const cities     = ['all', 'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli'];
  const platforms  = ['all', 'Zomato', 'Swiggy', 'Uber Eats', 'Amazon', 'Zepto', 'Blinkit'];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card flex flex-wrap gap-3">
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name / email / phone…"
          className="input flex-1 min-w-48"
        />
        <select value={city} onChange={(e) => setCity(e.target.value)} className="input w-40">
          {cities.map((c) => <option key={c} value={c}>{c === 'all' ? 'All Cities' : c}</option>)}
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input w-40">
          {platforms.map((p) => <option key={p} value={p}>{p === 'all' ? 'All Platforms' : p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Workers ({users.length})</h3>
        </div>
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No workers found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Phone</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Platform</th>
                <th className="pb-3 pr-4">Avg Income</th>
                <th className="pb-3 pr-4">Joined</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">{u.phone}</td>
                  <td className="py-3 pr-4">{u.city || '—'}</td>
                  <td className="py-3 pr-4">{u.deliveryPlatform || '—'}</td>
                  <td className="py-3 pr-4">₹{u.avgDailyIncome?.toLocaleString('en-IN') || 0}/day</td>
                  <td className="py-3 pr-4">{formatDate(u.createdAt)}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE(u.onboardingComplete)}`}>
                      {u.onboardingComplete ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleStatus(u._id, u.onboardingComplete)}
                      className={`text-xs hover:underline ${u.onboardingComplete ? 'text-red-600' : 'text-green-600'}`}
                    >
                      {u.onboardingComplete ? 'Suspend' : 'Activate'}
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
