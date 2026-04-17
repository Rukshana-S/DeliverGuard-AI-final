import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';

export default function BankSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ bankName: '', accountNumber: '', ifscCode: '', holderName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put('/user/profile', {
        bankAccount: {
          bankName: form.bankName,
          accountNumber: form.accountNumber,
          ifscCode: form.ifscCode.toUpperCase(),
          holderName: form.holderName,
        },
      });
      navigate('/coverage');
    } catch {
      setError('Failed to save bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-lg"
      >
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Profile', 'Bank', 'Plan'].map((step, i) => (
            <div key={step} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
              <span className={`text-xs font-medium ${i <= 1 ? 'text-blue-600' : 'text-gray-400'}`}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Bank Account Setup</h2>
        <p className="text-sm text-gray-500 mb-6">Your payouts will be transferred to this account instantly.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Account Holder Name</label>
            <input id="holderName" name="holderName" className="input" placeholder="As per bank records" value={form.holderName} onChange={set('holderName')} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Bank Name</label>
            <input id="bankName" name="bankName" className="input" placeholder="e.g. State Bank of India" value={form.bankName} onChange={set('bankName')} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Account Number</label>
            <input id="accountNumber" name="accountNumber" className="input" type="text" placeholder="Enter account number" value={form.accountNumber} onChange={set('accountNumber')} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">IFSC Code</label>
            <input id="ifscCode" name="ifscCode" className="input" placeholder="e.g. SBIN0001234" value={form.ifscCode} onChange={set('ifscCode')} required />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
            🔒 Your bank details are encrypted and used only for claim payouts.
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/setup/profile')} className="btn-secondary flex-1">← Back</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Continue →'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
