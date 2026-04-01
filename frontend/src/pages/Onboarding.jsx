import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PLATFORMS    = ['Zomato'];
const HOUR_OPTIONS = [
  { label: '4–6 hours', value: 5 },
  { label: '6–8 hours', value: 7 },
  { label: '8+ hours',  value: 9 },
];
const STEPS = [
  { id: 1, label: 'Profile Setup', icon: '👤' },
  { id: 2, label: 'Earnings Info', icon: '💼' },
  { id: 3, label: 'Payout Info',   icon: '🏦' },
];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-between mb-8 px-1">
      {STEPS.map((s, i) => {
        const done   = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                transition-all duration-300
                ${done   ? 'bg-green-500 text-white shadow-md shadow-green-200'
                : active ? 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-4 ring-blue-100'
                         : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? '✓' : s.icon}
              </div>
              <span className={`text-xs font-medium hidden sm:block
                ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500
                ${s.id < current ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}

function StepHeading({ icon, title, sub }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function NavButtons({ onBack, onNext, nextLabel = 'Continue →', nextDisabled = false }) {
  return (
    <div className="flex gap-3 pt-2">
      {onBack && (
        <button type="button" onClick={onBack}
          className="flex-1 py-3 rounded-xl font-semibold border border-gray-200
                     text-gray-600 hover:bg-gray-50 transition-colors">
          ← Back
        </button>
      )}
      {onNext && (
        <button type="button" onClick={onNext} disabled={nextDisabled}
          className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-sm transition-colors">
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [profile, setProfile] = useState({
    name:             user?.name             || '',
    phone:            user?.phone            || '',
    email:            user?.email            || '',
    city:             user?.city             || '',
    deliveryPlatform: user?.deliveryPlatform || 'Zomato',
    avgDailyIncome:   user?.avgDailyIncome   || '',
  });

  const [earnings, setEarnings] = useState({
    workingHours:  user?.workingHours || 7,
    deliveryZones: (user?.deliveryZones || []).join(', '),
  });

  const [payout, setPayout] = useState({
    holderName:    user?.bankAccount?.holderName    || '',
    bankName:      user?.bankAccount?.bankName      || '',
    accountNumber: user?.bankAccount?.accountNumber || '',
    ifscCode:      user?.bankAccount?.ifscCode      || '',
  });

  const setP = (setter) => (k) => (e) =>
    setter((prev) => ({ ...prev, [k]: e.target.value }));

  const next = () => { setError(''); setStep((s) => s + 1); };
  const back = () => { setError(''); setStep((s) => s - 1); };

  const handleComplete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired. Please log in again.');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        name:             profile.name,
        phone:            profile.phone,
        city:             profile.city,
        deliveryPlatform: profile.deliveryPlatform,
        avgDailyIncome:   Number(profile.avgDailyIncome),
        workingHours:     Number(earnings.workingHours),
        deliveryZones:    earnings.deliveryZones.split(',').map((z) => z.trim()).filter(Boolean),
        bankAccount: {
          holderName:    payout.holderName,
          bankName:      payout.bankName,
          accountNumber: payout.accountNumber,
          ifscCode:      payout.ifscCode.toUpperCase(),
        },
      };
      const { data } = await api.post('/user/onboarding', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser({ ...data, onboardingComplete: true });
      setTimeout(() => navigate('/dashboard'), 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const variants = {
    enter:  { opacity: 0, x: 32 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: -32 },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-4xl select-none">🛡️</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-2">Complete Your Profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            Set up your account to start protecting your income.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8"
        >
          <StepBar current={step} />

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 border border-red-100">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.18 }}
            >

              {/* Step 1 — Profile Setup */}
              {step === 1 && (
                <div className="space-y-4">
                  <StepHeading icon="👤" title="Basic Information"
                    sub="Tell us about yourself so we can personalise your protection." />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name">
                      <input className="input" placeholder="Rahul Sharma"
                        value={profile.name} onChange={setP(setProfile)('name')} />
                    </Field>
                    <Field label="Phone Number">
                      <input className="input" placeholder="+91 98765 43210" type="tel"
                        value={profile.phone} onChange={setP(setProfile)('phone')} />
                    </Field>
                    <Field label="Email Address">
                      <input className="input" placeholder="you@email.com" type="email"
                        value={profile.email} onChange={setP(setProfile)('email')} />
                    </Field>
                    <Field label="City">
                      <input className="input" placeholder="Mumbai"
                        value={profile.city} onChange={setP(setProfile)('city')} />
                    </Field>
                    <Field label="Delivery Platform">
                      <select className="input" value={profile.deliveryPlatform}
                        onChange={setP(setProfile)('deliveryPlatform')}>
                        {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </Field>
                    <Field label="Average Daily Income (₹)">
                      <input className="input" placeholder="e.g. 800" type="number" min="0"
                        value={profile.avgDailyIncome}
                        onChange={setP(setProfile)('avgDailyIncome')} />
                    </Field>
                  </div>
                  <NavButtons onNext={() => {
                    if (!profile.name || !profile.phone || !profile.city || !profile.avgDailyIncome)
                      return setError('Please fill all required fields.');
                    next();
                  }} />
                </div>
              )}

              {/* Step 2 — Earnings Info */}
              {step === 2 && (
                <div className="space-y-5">
                  <StepHeading icon="💼" title="Work Information"
                    sub="Help us understand your work schedule and delivery areas." />
                  <Field label="Daily Working Hours">
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {HOUR_OPTIONS.map((opt) => (
                        <button key={opt.label} type="button"
                          onClick={() => setEarnings((e) => ({ ...e, workingHours: opt.value }))}
                          className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all
                            ${earnings.workingHours === opt.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Primary Delivery Zones">
                    <input className="input" placeholder="Andheri West, Bandra, Powai"
                      value={earnings.deliveryZones}
                      onChange={setP(setEarnings)('deliveryZones')} />
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      We use this to detect disruptions like heavy rain or traffic in your delivery area.
                    </p>
                  </Field>
                  <NavButtons onBack={back} onNext={() => {
                    if (!earnings.deliveryZones.trim())
                      return setError('Please enter at least one delivery zone.');
                    next();
                  }} />
                </div>
              )}

              {/* Step 3 — Payout Info */}
              {step === 3 && (
                <div className="space-y-4">
                  <StepHeading icon="🏦" title="Payout Information" sub="" />
                  <div className="flex items-start gap-3 bg-blue-50 border border-blue-100
                                  rounded-xl px-4 py-3 text-sm text-blue-700">
                    <span className="text-lg shrink-0">💳</span>
                    <p>Add your bank details so we can transfer insurance payouts directly
                       to your account when disruptions occur.</p>
                  </div>
                  <Field label="Account Holder Name">
                    <input className="input" placeholder="As per bank records"
                      value={payout.holderName} onChange={setP(setPayout)('holderName')} />
                  </Field>
                  <Field label="Bank Name">
                    <input className="input" placeholder="e.g. State Bank of India"
                      value={payout.bankName} onChange={setP(setPayout)('bankName')} />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Account Number">
                      <input className="input" placeholder="Enter account number"
                        value={payout.accountNumber} onChange={setP(setPayout)('accountNumber')} />
                    </Field>
                    <Field label="IFSC Code">
                      <input className="input" placeholder="e.g. SBIN0001234"
                        value={payout.ifscCode} onChange={setP(setPayout)('ifscCode')} />
                    </Field>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <span>🔒</span> Your bank details are encrypted and used only for claim payouts.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={back}
                      className="flex-1 py-3 rounded-xl font-semibold border border-gray-200
                                 text-gray-600 hover:bg-gray-50 transition-colors">
                      ← Back
                    </button>
                    <button type="button" onClick={() => {
                      if (!payout.holderName || !payout.bankName || !payout.accountNumber || !payout.ifscCode)
                        return setError('Please fill all bank details.');
                      handleComplete();
                    }} disabled={loading}
                      className="flex-1 py-3 rounded-xl font-semibold text-white
                                 bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                                 shadow-sm transition-colors">
                      {loading ? 'Saving…' : '🛡️ Complete Setup'}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-gray-400 text-xs mt-4">
          Step {step} of {STEPS.length}
        </p>
      </div>
    </div>
  );
}
