import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePolicy } from '../context/PolicyContext';
import { getClaims } from '../services/claimService';
import { getCoverageStatus } from '../services/premiumService';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, getStatusBadge } from '../utils/helpers';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Wallet, Upload, ClipboardList,
  TrendingUp, CreditCard, FileSearch, Zap, Inbox,
  AlertTriangle, Clock,
} from 'lucide-react';

const RISK_LEVEL = (claims, loyaltyPoints = 0) => {
  const recent = claims.filter((c) => {
    const d = new Date(c.createdAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;
  // Good loyalty points (>=100) lower the risk by one level
  const bonus = loyaltyPoints >= 100;
  if (recent >= 3 && !bonus) return { label: 'High',   color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' };
  if (recent >= 3 &&  bonus) return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
  if (recent >= 1)           return { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' };
  return                            { label: 'Low',    color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' };
};

export default function Dashboard() {
  const { user } = useAuth();
  const { policy } = usePolicy();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [coverage, setCoverage] = useState(null);

  useEffect(() => {
    getClaims().then((r) => setClaims(r.data)).catch(() => {});
    getCoverageStatus().then((r) => setCoverage(r.data)).catch(() => {});
  }, []);

  const totalPaid = claims.filter((c) => c.status === 'paid').reduce((s, c) => s + c.claimAmount, 0);
  const risk = RISK_LEVEL(claims, user?.loyaltyPoints || 0);
  const chartData = [...claims].reverse().slice(-7).map((c) => ({
    date: formatDate(c.createdAt),
    amount: c.claimAmount,
  }));

  return (
    <div className="space-y-6">
      {/* Premium due alert */}
      {policy && coverage && !coverage.active && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className="text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Weekly Insurance Premium Due</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Upload salary proof to calculate your premium and continue coverage.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload-salary-proof')}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            Upload Salary Screenshot
          </button>
        </motion.div>
      )}

      {/* Grace period warning */}
      {policy && coverage?.inGrace && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Clock size={22} className="text-orange-500 shrink-0" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Grace Period Active</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                Coverage expires soon. Pay your premium before the grace deadline to avoid interruption.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/upload-salary-proof')}
            className="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
          >
            Pay Now
          </button>
        </motion.div>
      )}

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Welcome back, {user?.name?.split(' ')[0]}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{user?.deliveryPlatform} · {user?.city}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${risk.bg} ${risk.color}`}>
          Risk: {risk.label}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Policy"     value={policy ? policy.planType.toUpperCase() : 'None'}                          icon={ShieldCheck}   color="blue"   subtitle={policy ? `${policy.premiumPct ?? policy.weeklyPremium}% of weekly income` : 'No active plan'} />
        <StatCard title="Max Weekly Payout" value={policy ? formatCurrency(policy.maxWeeklyPayout ?? policy.coverageAmount) : '—'} icon={Wallet}      color="green"  subtitle="Income protection cap" />
        <StatCard title="Total Payouts"     value={formatCurrency(totalPaid)}                                                  icon={TrendingUp}    color="purple" subtitle="All time" />
        <StatCard title="Total Claims"      value={claims.length}                                                              icon={ClipboardList} color="orange" subtitle={`${claims.filter((c) => c.status === 'pending').length} pending`} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Upgrade Policy',     Icon: TrendingUp,  to: '/coverage',            color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { label: 'Pay Weekly Premium', Icon: CreditCard,  to: '/upload-salary-proof', color: 'bg-green-600 hover:bg-green-700 text-white' },
          { label: 'Check Claim Status', Icon: FileSearch,  to: '/claims',              color: 'bg-purple-600 hover:bg-purple-700 text-white' },
        ].map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(a.to)}
            className={`${a.color} rounded-xl p-4 text-left font-medium transition-colors`}
          >
            <a.Icon size={22} className="block mb-1" />
            {a.label}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/claim/detected')}
          className="sm:col-span-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl p-4 text-left font-medium transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Zap size={22} />
            Simulate Disruption Claim
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">Demo Mode</span>
        </motion.button>
      </div>

      {/* Charts + recent claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Payout History (Last 7 Claims)">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No payout data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">Recent Activity</h3>
          {claims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <Inbox size={32} className="mb-2" />
              <p className="text-sm">No claims yet. You're protected!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.slice(0, 5).map((c) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => navigate(`/claims/${c._id}`)}
                  className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium capitalize">{c.disruptionType.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-400">{formatDate(c.createdAt)} · {c.location?.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(c.claimAmount)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(c.status)}`}>{c.status}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
