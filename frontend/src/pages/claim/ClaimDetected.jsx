import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClaimStepper from './ClaimStepper';
import { getCoverageStatus } from '../../services/premiumService';
import { createClaim } from '../../services/claimService';
import api from '../../services/api';
import { CloudRain, Thermometer, Wind, TrafficCone, Lock, ShieldCheck, Clock } from 'lucide-react';

const DISRUPTION_OPTIONS = [
  { value: 'heavy_rain',   label: 'Heavy Rain',   Icon: CloudRain,    defaultValue: 65 },
  { value: 'extreme_heat', label: 'Extreme Heat', Icon: Thermometer,  defaultValue: 43 },
  { value: 'aqi_hazard',   label: 'AQI Hazard',   Icon: Wind,         defaultValue: 320 },
  { value: 'traffic_jam',  label: 'Traffic Jam',  Icon: TrafficCone,  defaultValue: 0.3 },
];

export default function ClaimDetected() {
  const navigate = useNavigate();
  const [coverage,  setCoverage]  = useState(null);
  const [checking,  setChecking]  = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState('');
  const [selected,  setSelected]  = useState('heavy_rain');
  const [city,      setCity]      = useState('');

  useEffect(() => {
    getCoverageStatus()
      .then((r) => setCoverage(r.data))
      .catch(() => setCoverage({ active: false, reason: 'error' }))
      .finally(() => setChecking(false));

    // Pre-fill city from user profile
    api.get('/auth/me').then((r) => setCity(r.data.city || '')).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const disruption = DISRUPTION_OPTIONS.find((d) => d.value === selected);
      const { data: claim } = await createClaim({
        disruptionType:  selected,
        disruptionValue: disruption.defaultValue,
        location:        { city: city || 'Unknown' },
      });
      // Pass real claim data to next step
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

  // Coverage inactive — block claim flow
  if (!coverage?.active) return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
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
              className="text-xs text-red-500 font-medium flex items-center gap-1">
              Coverage expired due to unpaid premium.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
      <button
        onClick={() => navigate('/upload-salary-proof')}
        className="w-full py-3 rounded-2xl font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
      >
        Upload Salary Screenshot →
      </button>
      <button onClick={() => navigate('/dashboard')} className="btn-secondary w-full py-3">
        Back to Dashboard
      </button>
    </div>
  );

  const disruption = DISRUPTION_OPTIONS.find((d) => d.value === selected);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <ClaimStepper />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{disruption.icon}</span>
          <div>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">File a Claim</p>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Select Disruption Type</h2>
          </div>
        </div>

        {/* Disruption selector */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {DISRUPTION_OPTIONS.map((d) => (
            <button key={d.value} onClick={() => setSelected(d.value)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                ${selected === d.value
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300'}`}
            >
              <d.Icon size={15} />{d.label}
            </button>
          ))}
        </div>

        {/* City input */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Your City</label>
          <input
            className="input"
            placeholder="e.g. Mumbai"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3"
      >
        <ShieldCheck size={22} className="text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-700 dark:text-green-400">Your income protection is active.</p>
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
          disabled={submitting || !city.trim()}
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
