import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { formatCurrency } from '../utils/helpers';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  HardHat, ShieldCheck, ClipboardList, CalendarCheck,
  Banknote, Users, FileSearch, DollarSign, Zap, AlertTriangle, TrafficCone,
} from 'lucide-react';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const QUICK_LINKS = [
  { label: 'Manage Workers',  Icon: Users,         to: '/admin/users' },
  { label: 'Review Claims',   Icon: FileSearch,    to: '/admin/claims' },
  { label: 'Payout Control',  Icon: DollarSign,    to: '/admin/payouts' },
  { label: 'Disruptions',     Icon: Zap,           to: '/admin/disruptions' },
  { label: 'Fraud Alerts',    Icon: AlertTriangle, to: '/admin/fraud' },
  { label: 'Traffic Monitor', Icon: TrafficCone,   to: '/admin/traffic' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/analytics'),
    ]).then(([s, a]) => { setStats(s.data); setAnalytics(a.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { title: 'Total Workers',   value: stats.totalWorkers,                 icon: HardHat,       color: 'blue'   },
    { title: 'Active Policies', value: stats.activePolicies,               icon: ShieldCheck,   color: 'green'  },
    { title: 'Total Claims',    value: stats.totalClaims,                  icon: ClipboardList, color: 'orange' },
    { title: 'Claims Today',    value: stats.claimsToday,                  icon: CalendarCheck, color: 'purple' },
    { title: 'Monthly Payouts', value: formatCurrency(stats.totalPayouts), icon: Banknote,      color: 'blue'   },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100 dark:bg-gray-800" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((s) => <StatCard key={s.title} {...s} />)}
        </div>
      )}

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map((l) => (
          <motion.button
            key={l.to}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(l.to)}
            className="card flex flex-col items-center gap-2 py-4 hover:border-blue-200 dark:hover:border-blue-700 cursor-pointer transition-colors"
          >
            <l.Icon size={24} className="text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">{l.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Charts row 1 */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Claims by Disruption Type">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.claimsByType.map((d) => ({ name: d._id?.replace(/_/g,' '), count: d.count, total: d.total }))}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v, n) => n === 'total' ? formatCurrency(v) : v} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]} name="Claims" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Payout Distribution by City">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.payoutsByCity.map((d) => ({ city: d._id || 'Unknown', total: d.total }))}>
                  <XAxis dataKey="city" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#10b981" radius={[4,4,0,0]} name="Payouts" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Daily Claim Trend (Last 14 Days)">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.weeklyTrend.map((d) => ({ date: d._id, count: d.count }))}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Claims" />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Active Policy Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={analytics.planDist.map((d) => ({ name: d._id, value: d.count }))}
                    cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
