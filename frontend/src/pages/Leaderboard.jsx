import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TIER_COLORS = {
  Diamond: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/30',
  Gold:    'text-amber-500 bg-amber-50 dark:bg-amber-900/30',
  Silver:  'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

const RANK_STYLES = [
  { bg: 'bg-gradient-to-br from-amber-400 to-yellow-500',  text: 'text-white', label: '🥇' },
  { bg: 'bg-gradient-to-br from-gray-300 to-gray-400',     text: 'text-white', label: '🥈' },
  { bg: 'bg-gradient-to-br from-orange-400 to-amber-600',  text: 'text-white', label: '🥉' },
];

function TierBadge({ tier }) {
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_COLORS[tier] || TIER_COLORS.Silver}`}>
      {tier}
    </span>
  );
}

function TopCard({ user, rankIndex }) {
  const style = RANK_STYLES[rankIndex];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rankIndex * 0.1 }}
      className={`flex flex-col items-center p-5 rounded-2xl shadow-lg ${style.bg} ${style.text} relative`}
    >
      <span className="text-2xl mb-1">{style.label}</span>
      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center text-xl font-bold mb-2">
        {user.name?.[0]?.toUpperCase()}
      </div>
      <p className="font-bold text-sm text-center leading-tight">{user.name}</p>
      <p className="text-xs opacity-80 mt-0.5">{user.city || '—'}</p>
      <p className="text-lg font-extrabold mt-2">{user.loyaltyPoints} pts</p>
      <TierBadge tier={user.tier} />
    </motion.div>
  );
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData]       = useState([]);
  const [myRank, setMyRank]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then((r) => { setData(r.data.leaderboard); setMyRank(r.data.myRank); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const top3 = data.slice(0, 3);
  const rest  = data.slice(3);

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">

      {/* My Rank Card */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-800 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.city}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-2xl font-extrabold text-blue-600">#{myRank.rank}</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{myRank.loyaltyPoints} pts</p>
            <TierBadge tier={myRank.tier} />
          </div>
        </motion.div>
      )}

      {/* Top 3 */}
      {top3.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
            <Trophy size={13} /> Top Performers
          </p>
          <div className="grid grid-cols-3 gap-3">
            {top3.map((u, i) => <TopCard key={u._id} user={u} rankIndex={i} />)}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="card overflow-hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-1.5">
          <Medal size={13} /> Full Rankings
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left pb-2 font-medium">Rank</th>
                <th className="text-left pb-2 font-medium">Worker</th>
                <th className="text-left pb-2 font-medium">Tier</th>
                <th className="text-right pb-2 font-medium">Points</th>
                <th className="text-right pb-2 font-medium">Risk Score</th>
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
                    className={`border-b border-gray-50 dark:border-gray-800/50 transition-colors
                      ${isMe ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'}`}
                  >
                    <td className="py-3 pr-3">
                      <span className={`font-bold ${i < 3 ? 'text-amber-500' : 'text-gray-500'}`}>
                        #{u.rank}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-xs font-bold text-blue-600">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.city || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3"><TierBadge tier={u.tier} /></td>
                    <td className="py-3 text-right font-bold text-gray-800 dark:text-gray-100">
                      <span className="flex items-center justify-end gap-1">
                        <Star size={11} className="text-amber-400" />{u.loyaltyPoints}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`font-medium ${u.riskScore > 70 ? 'text-red-500' : u.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {u.riskScore}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {data.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">No data yet. Be the first on the leaderboard!</p>
          )}
        </div>
      </div>
    </div>
  );
}
