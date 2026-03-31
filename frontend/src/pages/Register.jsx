import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/authService';
import { motion } from 'framer-motion';

const PLATFORMS = ['Zomato', 'Swiggy', 'Uber Eats', 'Zepto', 'Blinkit', 'Other'];

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    deliveryPlatform: 'Zomato', city: '',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await register(form);
      loginUser(data.token, data.user);
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md"
      >
        <div className="text-center mb-6">
          <span className="text-4xl select-none">🛡️</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start protecting your income today</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Full Name"  value={form.name}     onChange={set('name')}     required />
          <input className="input" type="email" placeholder="Email"    value={form.email}    onChange={set('email')}    required />
          <input className="input" type="tel"   placeholder="Phone"    value={form.phone}    onChange={set('phone')}    required />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
          <input className="input" placeholder="City"   value={form.city}     onChange={set('city')}     required />
          <select className="input" value={form.deliveryPlatform} onChange={set('deliveryPlatform')}>
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-blue-600
                       hover:bg-blue-700 disabled:opacity-60 transition-colors mt-1"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
