import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldX, X } from 'lucide-react';

function BlockedModal({ onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        style={{ backdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center relative"
        >
          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={14} className="text-gray-500" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <ShieldX size={32} className="text-red-500" />
          </div>

          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Account Blocked</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Your account has been blocked by the admin.<br />
            Please contact support for assistance.
          </p>

          <div className="space-y-2.5">
            <button onClick={onClose}
              className="block w-full py-2.5 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors text-sm">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function Login() {
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Show modal if redirected from auto-logout due to block
  useState(() => {
    if (searchParams.get('blocked') === '1') setBlocked(true);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login(form);
      loginUser(data.token, data.user);
      if (data.user.role === 'admin') { navigate('/admin'); return; }
      navigate(data.user.onboardingComplete ? '/dashboard' : '/onboarding');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'ACCOUNT_BLOCKED') {
        setBlocked(true);
      } else {
        setError(msg || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      {blocked && <BlockedModal onClose={() => setBlocked(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-4xl select-none">🛡️</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">DeliverGuard AI</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input id="email" name="email"
            className="input" type="email" placeholder="Email address"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
          />
          <input id="password" name="password"
            className="input" type="password" placeholder="Password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
          />
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
