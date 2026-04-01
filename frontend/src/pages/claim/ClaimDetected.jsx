import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getCoverageStatus } from '../../services/premiumService';
import { createClaim } from '../../services/claimService';
import { useAuth } from '../../context/AuthContext';
import { Lock, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function ClaimDetected() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [coverage,   setCoverage]   = useState(null);
  const [checking,   setChecking]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    getCoverageStatus()
      .then((r) => setCoverage(r.data))
      .catch(() => setCoverage({ active: false, reason: 'error' }))
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const { data: claim } = await createClaim({
        disruptionType:  'heavy_rain',
        disruptionValue: 65,
        location:        { city: user?.city || 'Unknown' },
      });
      navigate('/claim/status', { state: { claimId: claim._id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!coverage?.active) return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="card border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20 space-y-4"
      >
        <div className="flex items-center gap-3">
          <Lock size={36} className="text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Coverage Inactive</p>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Premium Payment Required</h2>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your insurance coverage is inactive. Please pay the weekly premium to continue protection and process claims.
        </p>
        <AnimatePresence>
          {coverage?.reason === 'expired' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-red-500 font-medium">
              Coverage expired due to unpaid premium.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
      <button onClick={() => navigate('/upload-salary-proof')}
        className="w-full py-3 rounded-2xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors">
        Upload Salary Screenshot →
      </button>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-3">
        Back to Dashboard
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />

      {/* Top bar — location + demo badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <MapPin size={14} className="text-blue-500" />
          <span>Location verified: <span className="font-semibold">{user?.city || 'Unknown'}</span></span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          Demo Mode
        </span>
      </motion.div>

      {/* Detected Disruptions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card space-y-3"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Detected Disruptions</p>

        {/* Single disruption card */}
        <div className="flex items-center gap-4 p-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-xl shrink-0">
            🌧️
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800 dark:text-gray-100">Heavy Rain</p>
            <p className="text-xs text-gray-500 mt-0.5">Value: 65 · Threshold exceeded</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500 text-white shrink-0">
            Selected
          </span>
        </div>
      </motion.div>

      {/* Coverage active */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
      >
        <ShieldCheck size={20} className="text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Your income protection is active.</p>
          {coverage?.inGrace && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
              <Clock size={11} /> Grace period — pay premium soon.
            </p>
          )}
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Claim…
            </span>
          ) : 'Submit Claim →'}
        </button>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-3 text-base">
          Cancel
        </button>
      </div>
    </div>
  );
}
