import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { UserCircle, Bike, Landmark, Lock } from 'lucide-react';

const PLATFORMS = ['Zomato', 'Swiggy', 'Uber Eats', 'Zepto', 'Blinkit', 'Other'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('personal');
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    avgDailyIncome: user?.avgDailyIncome || '',
    workingHours: user?.workingHours || 8,
    deliveryPlatform: user?.deliveryPlatform || 'Zomato',
    deliveryZones: user?.deliveryZones?.join(', ') || '',
    bankName: user?.bankAccount?.bankName || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    ifscCode: user?.bankAccount?.ifscCode || '',
    holderName: user?.bankAccount?.holderName || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const setPw = (k) => (e) => setPwForm({ ...pwForm, [k]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put('/user/profile', {
        name: form.name,
        phone: form.phone,
        city: form.city,
        avgDailyIncome: Number(form.avgDailyIncome),
        workingHours: Number(form.workingHours),
        deliveryPlatform: form.deliveryPlatform,
        deliveryZones: form.deliveryZones.split(',').map((z) => z.trim()).filter(Boolean),
        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode,
          holderName: form.holderName,
        },
      });
      updateUser({
        name: form.name, phone: form.phone, city: form.city,
        avgDailyIncome: Number(form.avgDailyIncome),
        workingHours: Number(form.workingHours),
        deliveryPlatform: form.deliveryPlatform,
      });
      setSaved('Profile saved successfully!');
      setTimeout(() => setSaved(''), 3000);
    } catch {
      setError('Failed to save profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await api.put('/user/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setSaved('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const TABS = [
    { key: 'personal', label: 'Personal Info', Icon: UserCircle },
    { key: 'work',     label: 'Work Details',  Icon: Bike },
    { key: 'bank',     label: 'Bank Account',  Icon: Landmark },
    { key: 'security', label: 'Security',      Icon: Lock },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      {/* Avatar + name */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-2xl font-bold text-blue-600">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg text-gray-800 dark:text-gray-100">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email} · {user?.deliveryPlatform}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors ${
              tab === t.key ? 'bg-white dark:bg-gray-900 text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            <t.Icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {saved && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-600 rounded-xl p-3 text-sm">{saved}</motion.div>}
      {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

      <form onSubmit={handleSave}>
        {tab === 'personal' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Full Name</label><input className="input" value={form.name} onChange={set('name')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
              <div className="col-span-2"><label className="text-xs text-gray-500 mb-1 block">City</label><input className="input" value={form.city} onChange={set('city')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}

        {tab === 'work' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Work Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Delivery Platform</label>
                <select className="input" value={form.deliveryPlatform} onChange={set('deliveryPlatform')}>
                  {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Working Hours/Day</label><input className="input" type="number" value={form.workingHours} onChange={set('workingHours')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Avg Daily Income (₹)</label><input className="input" type="number" value={form.avgDailyIncome} onChange={set('avgDailyIncome')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Delivery Zones</label><input className="input" placeholder="Andheri, Bandra..." value={form.deliveryZones} onChange={set('deliveryZones')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}

        {tab === 'bank' && (
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">Bank Account</h3>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label><input className="input" value={form.holderName} onChange={set('holderName')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Bank Name</label><input className="input" value={form.bankName} onChange={set('bankName')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Account Number</label><input className="input" value={form.accountNumber} onChange={set('accountNumber')} /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">IFSC Code</label><input className="input" value={form.ifscCode} onChange={set('ifscCode')} /></div>
            </div>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        )}
      </form>

      {tab === 'security' && (
        <form onSubmit={handlePasswordChange} className="card space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">Change Password</h3>
          <div><label className="text-xs text-gray-500 mb-1 block">Current Password</label><input className="input" type="password" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">New Password</label><input className="input" type="password" value={pwForm.newPassword} onChange={setPw('newPassword')} required /></div>
          <div><label className="text-xs text-gray-500 mb-1 block">Confirm New Password</label><input className="input" type="password" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')} required /></div>
          <button type="submit" className="btn-primary">Update Password</button>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-2">Two-Factor Authentication</h4>
            <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account.</p>
            <button type="button" className="btn-secondary text-sm">Enable 2FA (Coming Soon)</button>
          </div>
        </form>
      )}
    </div>
  );
}
