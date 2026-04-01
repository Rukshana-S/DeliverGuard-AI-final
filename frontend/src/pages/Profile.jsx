import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircle, Bike, Landmark, Lock, Trophy, Star,
  Shield, AlertTriangle, LayoutDashboard,
} from 'lucide-react';

const PLATFORMS = ['Zomato'];

const getTier   = (pts) => pts >= 500 ? 'Diamond' : pts >= 200 ? 'Gold' : 'Silver';
const getNext   = (pts) => {
  if (pts < 200) return { name: 'Gold',    target: 200 };
  if (pts < 500) return { name: 'Diamond', target: 500 };
  return { name: 'Max', target: 500 };
};

const TABS = [
  { key: 'overview',  label: 'Overview',      Icon: LayoutDashboard },
  { key: 'personal',  label: 'Personal Info',  Icon: UserCircle },
  { key: 'work',      label: 'Work Details',   Icon: Bike },
  { key: 'bank',      label: 'Bank Account',   Icon: Landmark },
  { key: 'security',  label: 'Security',       Icon: Lock },
];

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab,    setTab]    = useState('overview');
  const [saved,  setSaved]  = useState('');
  const [error,  setError]  = useState('');

  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '', city: user?.city || '',
    avgDailyIncome: user?.avgDailyIncome || '', workingHours: user?.workingHours || 8,
    deliveryPlatform: user?.deliveryPlatform || 'Zomato',
    deliveryZones: user?.deliveryZones?.join(', ') || '',
    bankName: user?.bankAccount?.bankName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    ifscCode: user?.bankAccount?.ifscCode || '',
    holderName: user?.bankAccount?.holderName || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set   = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPw = (k) => (e) => setPwForm({ ...pwForm, [k]: e.target.value });

  const flash = (msg, isErr = false) => {
    isErr ? setError(msg) : setSaved(msg);
    setTimeout(() => isErr ? setError('') : setSaved(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/user/profile', {
        name: form.name, phone: form.phone, city: form.city,
        avgDailyIncome: Number(form.avgDailyIncome),
        workingHours: Number(form.workingHours),
        deliveryPlatform: form.deliveryPlatform,
        deliveryZones: form.deliveryZones.split(',').map((z) => z.trim()).filter(Boolean),
        bankAccount: { bankName: form.bankName, accountNumber: form.accountNumber, ifscCode: form.ifscCode, holderName: form.holderName },
      });
      updateUser({ name: form.name, phone: form.phone, city: form.city, avgDailyIncome: Number(form.avgDailyIncome), workingHours: Number(form.workingHours), deliveryPlatform: form.deliveryPlatform });
      flash('Profile saved successfully!');
    } catch { flash('Failed to save profile.', true); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { flash('Passwords do not match.', true); return; }
    try {
      await api.put('/user/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      flash('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { flash(err.response?.data?.message || 'Failed to update password.', true); }
  };

  const pts      = user?.loyaltyPoints || 0;
  const tier     = getTier(pts);
  const next     = getNext(pts);
  const progress = Math.min((pts / next.target) * 100, 100);

  const STATS = [
    { label: 'Loyalty Points', value: pts,                    Icon: Star,          color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Risk Score',     value: user?.riskScore || 0,   Icon: Shield,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Fraud Events',   value: user?.fraudEvents || 0, Icon: AlertTriangle, color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';

  return (
    <div className="space-y-6">

      {/* ── Gradient Profile Card ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #4B5563 0%, #374151 40%, #1E3A5F 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between gap-4">
          {/* Left: avatar + info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-extrabold shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-extrabold leading-tight">{user?.name}</p>
              <p className="text-sm text-white/70 mt-0.5">{user?.email}</p>
              <p className="text-xs text-white/60 mt-0.5">{user?.city} · {user?.deliveryPlatform}</p>
            </div>
          </div>

          {/* Right: tier + rank */}
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5 mb-1">
              <Trophy size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">{tier}</span>
            </div>
            <p className="text-4xl font-extrabold leading-none">#{user?.rank || '—'}</p>
            <p className="text-xs text-white/60 mt-0.5">Rank</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5">
          <div className="flex justify-between text-xs text-white/60 mb-1.5">
            <span>{pts} pts</span>
            <span>{pts >= 500 ? '🎉 Max tier!' : `${next.target - pts} pts to ${next.name}`}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map(({ label, value, Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card flex flex-col items-center py-5 gap-2 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon size={20} className={color} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}>
            <t.Icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {saved && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl px-4 py-3 text-sm border border-green-200 dark:border-green-800">{saved}</motion.div>}
        {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm border border-red-200 dark:border-red-800">{error}</motion.div>}
      </AnimatePresence>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">

        {/* Overview */}
        {tab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Account Overview</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Name',       user?.name],
                ['Email',      user?.email],
                ['Phone',      user?.phone || '—'],
                ['City',       user?.city || '—'],
                ['Platform',   user?.deliveryPlatform || '—'],
                ['Role',       user?.role],
                ['Avg Income', user?.avgDailyIncome ? `₹${user.avgDailyIncome}/day` : '—'],
                ['Work Hours', user?.workingHours ? `${user.workingHours} hrs/day` : '—'],
              ].map(([label, value]) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800/60 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Personal Info */}
        {tab === 'personal' && (
          <motion.div key="personal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSave} className="card space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name"><input className={inputCls} value={form.name} onChange={set('name')} /></Field>
                <Field label="Phone"><input className={inputCls} value={form.phone} onChange={set('phone')} /></Field>
                <Field label="City" ><input className={`${inputCls} col-span-2`} value={form.city} onChange={set('city')} /></Field>
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">Save Changes</button>
            </form>
          </motion.div>
        )}

        {/* Work Details */}
        {tab === 'work' && (
          <motion.div key="work" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSave} className="card space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Work Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Delivery Platform">
                  <select className={inputCls} value={form.deliveryPlatform} onChange={set('deliveryPlatform')}>
                    {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Working Hours/Day"><input className={inputCls} type="number" value={form.workingHours} onChange={set('workingHours')} /></Field>
                <Field label="Avg Daily Income (₹)"><input className={inputCls} type="number" value={form.avgDailyIncome} onChange={set('avgDailyIncome')} /></Field>
                <Field label="Delivery Zones"><input className={inputCls} placeholder="Andheri, Bandra…" value={form.deliveryZones} onChange={set('deliveryZones')} /></Field>
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">Save Changes</button>
            </form>
          </motion.div>
        )}

        {/* Bank Account */}
        {tab === 'bank' && (
          <motion.div key="bank" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handleSave} className="card space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Bank Account</h3>
              <div className="space-y-4">
                <Field label="Account Holder Name"><input className={inputCls} value={form.holderName} onChange={set('holderName')} /></Field>
                <Field label="Bank Name"><input className={inputCls} value={form.bankName} onChange={set('bankName')} /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Account Number"><input className={inputCls} value={form.accountNumber} onChange={set('accountNumber')} /></Field>
                  <Field label="IFSC Code"><input className={inputCls} value={form.ifscCode} onChange={set('ifscCode')} /></Field>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">Save Changes</button>
            </form>
          </motion.div>
        )}

        {/* Security */}
        {tab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <form onSubmit={handlePasswordChange} className="card space-y-5">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Change Password</h3>
              <Field label="Current Password"><input className={inputCls} type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="New Password"><input className={inputCls} type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} required /></Field>
                <Field label="Confirm Password"><input className={inputCls} type="password" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')} required /></Field>
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">Update Password</button>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Two-Factor Authentication</p>
                <p className="text-xs text-gray-400 mb-3">Add an extra layer of security to your account.</p>
                <button type="button" className="btn-secondary text-sm">Enable 2FA (Coming Soon)</button>
              </div>
            </form>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
