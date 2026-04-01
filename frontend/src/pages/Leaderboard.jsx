import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Star, Shield } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TIER_COLORS = {
  Diamond: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200',
  Gold:    'text-amber-600 bg-amber-50 dark:bg-amber-900/30 border border-amber-200',
  Silver:  'text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200',
};

const TOP3 = [
  {
    border: 'border-amber-400',
    bg:     'bg-amber-50',
    ring:   'ring-amber-400',
    avatar: 'from-amber-400 to-yellow-500',
    rank:   'text-amber-500',
    icon:   <Crown size={18} className="text-amber-500" />,
    label:  '🥇',
    shadow: '0 8px 32px rgba(245,158,11,0.2)',
  },
  {
    border: 'border-gray-300',
    bg:     'bg-gray-50',
    ring:   'ring-gray-300',
    avatar: 'from-gray-400 to-gray-500',
    rank:   'text-gray-500',
    icon:   <Medal size={18} className="text-gray-400" />,
    label:  '🥈',
    shadow: '0 8px 32px rgba(156,163,175,0.2)',
  },
  {
    border: 'border-orange-400',
    bg:     'bg-orange-50',
    ring:   'ring-orange-400',
    avatar: 'from-orange-400 to-amber-500',
    rank:   'text-orange-500',
    icon:   <Medal size={18} className="text-orange-400" />,
    label:  '🥉',
    shadow: '0 8px 32px rgba(249,115,22,0.2)',
  },
];

function TierBadge({ tier }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[tier] || TIER_COLORS.Silver}`}>
      {tier}
    </span>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data,    setData]    = useState([]);
  const [myRank,  setMyRank]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then((r) => { setData(r.data.leaderboard); setMyRank(r.data.myRank); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Use myRank points (fresh from DB) instead of stale auth context
  const displayPoints = myRank?.loyaltyPoints ?? user?.loyaltyPoints ?? 0;
  const displayRank   = myRank?.rank ?? '—';
  const displayTier   = myRank?.tier ?? 'Silver';

  const top3 = data.slice(0, 3);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ── Gradient Ranking Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl px-6 py-5 flex items-center justify-between text-white"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #7C3AED 100%)',
          boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-extrabold border-2 border-white/40">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-0.5">Your Ranking</p>
            <p className="text-lg font-extrabold leading-tight">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Shield size={12} className="text-white/70" />
              <span className="text-xs text-white/80 font-medium">
                {displayTier} Tier
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-5xl font-extrabold leading-none">#{displayRank}</p>
          <p className="text-sm text-white/70 mt-1 flex items-center justify-end gap-1">
            <Star size={12} className="text-yellow-300" />
            {displayPoints ?? 0} pts
          </p>
        </div>
      </motion.div>

      {/* ── Top 3 Highlight Cards ── */}
      {top3.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
            <Crown size={13} className="text-amber-400" /> Top Performers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3.map((u, i) => {
              const s = TOP3[i];
              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col items-center p-5 rounded-2xl border-2 ${s.border} ${s.bg} dark:bg-gray-800/60`}
                  style={{ boxShadow: s.shadow }}
                >
                  {/* Icon top-right */}
                  <div className="absolute top-3 right-3">{s.icon}</div>

                  {/* Avatar */}
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${s.avatar} flex items-center justify-center text-xl font-extrabold text-white mb-3 ring-4 ${s.ring} ring-offset-2`}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>

                  <p className="font-bold text-sm text-gray-800 dark:text-gray-100 text-center leading-tight">{u.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{u.city || '—'}</p>

                  <div className="mt-2 mb-2">
                    <TierBadge tier={u.tier} />
                  </div>

                  <p className="text-base font-extrabold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                    <Star size={12} className="text-amber-400" />{u.loyaltyPoints ?? 0} pts
                  </p>

                  {/* Rank badge bottom */}
                  <div className={`mt-3 text-2xl font-extrabold ${s.rank}`}>
                    {s.label} #{u.rank}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Full Rankings Table ── */}
      <div className="card overflow-hidden shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
          <Medal size={13} /> Full Rankings
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-3 pr-3">Rank</th>
                <th className="text-left pb-3">Worker</th>
                <th className="text-left pb-3">Tier</th>
                <th className="text-right pb-3">Points</th>
                <th className="text-right pb-3">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u, i) => {
                const isMe = u._id === myRank?._id?.toString();
                return (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors ${
                      isMe
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 pr-3">
                      {i < 3 ? (
                        <span className="text-lg">{['🥇','🥈','🥉'][i]}</span>
                      ) : (
                        <span className="font-bold text-gray-400">#{u.rank}</span>
                      )}
                    </td>

                    {/* Worker */}
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-gray-800 dark:text-gray-100 ${isMe ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                            {u.name} {isMe && <span className="text-xs font-normal text-blue-400">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{u.city || '—'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="py-3"><TierBadge tier={u.tier} /></td>

                    {/* Points */}
                    <td className="py-3 text-right">
                      <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center justify-end gap-1">
                        <Star size={11} className="text-amber-400" />{u.loyaltyPoints ?? 0} pts
                      </span>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 text-right">
                      <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                        u.riskScore > 70 ? 'bg-red-100 text-red-600' :
                        u.riskScore > 40 ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {u.riskScore}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>

          {data.length === 0 && (
            <div className="text-center py-12">
              <Crown size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">No rankings yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
