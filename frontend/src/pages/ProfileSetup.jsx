import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';

const PLATFORMS = ['Zomato', 'Swiggy', 'Amazon', 'Zepto', 'Other'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

export default function ProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    deliveryPlatform: 'Zomato',
    city: 'Mumbai',
    workingHours: 8,
    avgDailyIncome: '',
    deliveryZones: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put('/user/profile', {
        deliveryPlatform: form.deliveryPlatform,
        city: form.city,
        workingHours: Number(form.workingHours),
        avgDailyIncome: Number(form.avgDailyIncome),
        deliveryZones: form.deliveryZones.split(',').map((z) => z.trim()).filter(Boolean),
      });
      navigate('/setup/bank');
    } catch {
      setError('Failed to save profile. Please try again.');
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
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</div>
              <span className={`text-xs font-medium ${i === 0 ? 'text-blue-600' : 'text-gray-400'}`}>{step}</span>
              {i < 2 && <div className="flex-1 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Setup Your Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Tell us about your delivery work so we can calculate your risk.</p>

        {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Delivery Platform</label>
            <select id="deliveryPlatform" name="deliveryPlatform" className="input" value={form.deliveryPlatform} onChange={set('deliveryPlatform')}>
              {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">City</label>
            <select id="city" name="city" className="input" value={form.city} onChange={set('city')}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Daily Working Hours</label>
              <input id="workingHours" name="workingHours" className="input" type="number" min="1" max="16" value={form.workingHours} onChange={set('workingHours')} required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Avg Daily Income (₹)</label>
              <input id="avgDailyIncome" name="avgDailyIncome" className="input" type="number" min="0" placeholder="e.g. 800" value={form.avgDailyIncome} onChange={set('avgDailyIncome')} required />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Delivery Zones (comma separated)</label>
            <input id="deliveryZones" name="deliveryZones" className="input" placeholder="e.g. Andheri, Bandra, Kurla" value={form.deliveryZones} onChange={set('deliveryZones')} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Saving...' : 'Continue →'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
