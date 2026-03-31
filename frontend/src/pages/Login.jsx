import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import { motion } from 'framer-motion';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

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
      setError(err.response?.data?.message || 'Login failed');
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
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-blue-600
                       hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
