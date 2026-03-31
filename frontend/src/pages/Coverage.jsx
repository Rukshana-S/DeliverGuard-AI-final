import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePolicy } from '../context/PolicyContext';
import {
  CloudRain, Waves, Users, Building2, Wind,
  ClipboardList, ShieldCheck, Scale, Calculator,
  CalendarDays, Clock, Pin, Banknote, ScrollText,
} from 'lucide-react';

/* ─── Constants ──────────────────────────────────────────── */
const EXAMPLE_INCOME = 7000;
const STD_HRS        = 42;
const DAILY_HRS      = 6;

const PLANS = {
  basic:    { label: 'Basic',    premiumPct: 5,  hourThreshold: 8, maxPayout: 2000, accent: 'blue',   badge: null },
  standard: { label: 'Standard', premiumPct: 8,  hourThreshold: 6, maxPayout: 4000, accent: 'violet', badge: 'Popular' },
  premium:  { label: 'Premium',  premiumPct: 10, hourThreshold: 4, maxPayout: 8000, accent: 'amber',  badge: 'Best Value' },
};

const EVENTS = [
  { Icon: CloudRain,  label: 'Heavy Rain (>50mm/hr)' },
  { Icon: Waves,      label: 'Flood' },
  { Icon: Users,      label: 'Strike / Bandh' },
  { Icon: Building2,  label: 'Government Lockdown' },
  { Icon: Wind,       label: 'Environmental Disturbances' },
];

const A = {
  blue: {
    text:   'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500',
    ring:   'ring-2 ring-blue-500',
    btn:    'bg-blue-600 hover:bg-blue-700',
    badge:  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    pill:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    bar:    'border-l-blue-500',
    mono:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  },
  violet: {
    text:   'text-violet-600 dark:text-violet-400',
    border: 'border-violet-500',
    ring:   'ring-2 ring-violet-500',
    btn:    'bg-violet-600 hover:bg-violet-700',
    badge:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    pill:   'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
    bar:    'border-l-violet-500',
    mono:   'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300',
  },
  amber: {
    text:   'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500',
    ring:   'ring-2 ring-amber-500',
    btn:    'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    pill:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    bar:    'border-l-amber-500',
    mono:   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
  },
};

function calcEx(pct) {
  const hourly = EXAMPLE_INCOME / STD_HRS;
  return {
    hourly:  Math.round(hourly),
    daily:   Math.round(DAILY_HRS * hourly),
    premium: Math.round((pct / 100) * EXAMPLE_INCOME),
  };
}

function SecLabel({ Icon, title }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
      {Icon && <Icon size={13} />}{title}
    </p>
  );
}

function Box({ children, className = '' }) {
  return (
    <div className={`bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-4 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Full-screen Policy Page ────────────────────────────── */
function PolicyPage({ planKey, onClose }) {
  const { selectPlan, setPolicy } = usePolicy();
  const plan = PLANS[planKey];
  const a    = A[plan.accent];
  const e    = calcEx(plan.premiumPct);

  const [terms,    setTerms]    = useState(false);
  const [location, setLocation] = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [done,     setDone]     = useState(false);

  const canActivate = terms && location && !busy;

  const handleActivate = async () => {
    if (!canActivate) return;
    setBusy(true);
    try {
      const result = await selectPlan(planKey);
      if (setPolicy) setPolicy(result);
      setDone(true);
    } catch {
      alert('Activation failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center
                   bg-white dark:bg-gray-950 px-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16 }}
          className="mb-6"
        >
          <ShieldCheck size={80} className={a.text} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
            Your DeliverGuard AI protection is now active.
          </h2>
          <p className={`font-semibold text-lg mb-2 ${a.text}`}>{plan.label} Plan</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
            The system will automatically monitor disruptions and process payouts on your behalf.
          </p>
          <button onClick={onClose} className={`px-8 py-3 rounded-2xl font-semibold text-white shadow-lg ${a.btn}`}>
            Back to Coverage
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }} transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 flex flex-col bg-gray-50 dark:bg-gray-950"
    >
      <header className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-100
                         dark:border-gray-800 px-5 md:px-8 py-4 flex items-center
                         justify-between shadow-sm z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Policy Details</p>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{plan.label} Plan</h1>
        </div>
        <button onClick={onClose} aria-label="Close"
          className="w-9 h-9 flex items-center justify-center rounded-full font-bold
                     bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400
                     hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto w-full px-4 md:px-6 py-7 space-y-8 pb-6">

          <section>
            <SecLabel Icon={ClipboardList} title="Plan Summary" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Premium',           value: `${plan.premiumPct}% / week` },
                { label: 'Max Weekly Payout', value: `₹${plan.maxPayout.toLocaleString()}` },
                { label: 'Hour Threshold',    value: `${plan.hourThreshold} hrs` },
              ].map(({ label, value }) => (
                <Box key={label} className="text-center">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className={`font-extrabold text-sm leading-snug ${a.text}`}>{value}</p>
                </Box>
              ))}
            </div>
          </section>

          <section>
            <SecLabel Icon={ShieldCheck} title="Coverage Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EVENTS.map(({ Icon, label }) => (
                <div key={label}
                  className="flex items-center gap-3 bg-white dark:bg-gray-900
                             border border-gray-100 dark:border-gray-800
                             rounded-2xl px-4 py-3 text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                  <Icon size={16} className="text-gray-500 shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SecLabel Icon={Scale} title="Claim Rules" />
            <div className="space-y-3">
              <Box>
                <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">Hourly Income Formula</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Hourly Income = Previous Week Income ÷ 42 hrs
                  <span className="block text-xs mt-0.5 text-gray-400">(Standard: 6 hrs/day × 7 days = 42 hrs)</span>
                </p>
              </Box>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Box>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">Day Claim</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">If unable to work the full day:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">Payout = 6 × Hourly Income</p>
                </Box>
                <Box>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                    Hour Claim — {plan.hourThreshold} hr threshold
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Lost hours accumulate until threshold:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium">
                    Payout = {plan.hourThreshold} × Hourly Income
                  </p>
                </Box>
              </div>
              <div className={`rounded-2xl p-4 border-l-4 ${a.bar} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm`}>
                <p className="flex items-center gap-1.5 font-semibold text-gray-800 dark:text-white text-sm mb-2">
                  <Pin size={13} /> Example
                </p>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>Previous Week Income = <strong>₹{EXAMPLE_INCOME.toLocaleString()}</strong></p>
                  <p>Hourly Income = ₹{EXAMPLE_INCOME.toLocaleString()} ÷ 42 ≈ <strong>₹{e.hourly}/hr</strong></p>
                  <p>Daily Payout = 6 × ₹{e.hourly} ≈ <strong>₹{e.daily}</strong></p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SecLabel Icon={Banknote} title="Weekly Premium Calculation" />
            <p className="text-xs text-gray-400 mb-3">Based on ₹{EXAMPLE_INCOME.toLocaleString()} previous week income:</p>
            <div className="space-y-2">
              {Object.entries(PLANS).map(([key, p]) => {
                const isThis = key === planKey;
                const calc   = calcEx(p.premiumPct);
                return (
                  <div key={key}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition-all
                      ${isThis
                        ? `${A[p.accent].pill} font-semibold border ${A[p.accent].border}`
                        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                    <span>{p.label} Plan — {p.premiumPct}%</span>
                    <span className="font-bold">₹{calc.premium}/week</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <SecLabel Icon={ScrollText} title="Terms & Permissions" />
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer bg-white dark:bg-gray-900
                                border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm
                                hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <input type="checkbox" checked={terms} onChange={ev => setTerms(ev.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0 cursor-pointer" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to the{' '}
                  <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">
                    DeliverGuard AI Insurance Terms & Conditions
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer bg-white dark:bg-gray-900
                                border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm
                                hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <input type="checkbox" checked={location} onChange={ev => setLocation(ev.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0 cursor-pointer" />
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Allow location tracking during work hours
                  </p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Location is used to verify working hours, detect weather disruptions,
                    identify traffic jams, and automatically trigger insurance payouts.
                  </p>
                </div>
              </label>
            </div>
          </section>
          <div className="h-2" />
        </div>
      </div>

      <footer className="shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100
                         dark:border-gray-800 px-4 md:px-8 py-4 flex gap-3
                         shadow-[0_-4px_24px_rgba(0,0,0,0.07)]">
        <button onClick={onClose} className="flex-1 btn-secondary py-3 rounded-2xl font-semibold">Cancel</button>
        <button onClick={handleActivate} disabled={!canActivate}
          className={`flex-1 py-3 rounded-2xl font-semibold text-white transition-all duration-200
            ${canActivate ? `${a.btn} shadow-lg` : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
          {busy ? 'Activating…' : 'Activate Plan'}
        </button>
      </footer>
    </motion.div>
  );
}

/* ─── Main Coverage Page ─────────────────────────────────── */
export default function Coverage() {
  const { policy } = usePolicy();
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <>
      <div className="space-y-10">
        {policy && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className={`card flex items-center gap-4 border-2
              ${A[PLANS[policy.planType]?.accent]?.border ?? 'border-green-500'}
              bg-green-50 dark:bg-green-900/10`}>
            <ShieldCheck size={32} className="text-green-600 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-600 dark:text-green-400">Active Plan</p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-white capitalize">
                {policy.planType} — {PLANS[policy.planType]?.premiumPct ?? '—'}% of weekly income
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Max weekly payout: ₹{PLANS[policy.planType]?.maxPayout?.toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Insurance Coverage Plans</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Premium is a percentage of your previous week's income — not a fixed price.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(PLANS).map(([key, plan], i) => {
              const a        = A[plan.accent];
              const isActive = policy?.planType === key;
              const calc     = calcEx(plan.premiumPct);
              return (
                <motion.div key={key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -4, transition: { duration: 0.18 } }}
                  className={`card border-2 flex flex-col gap-5 relative shadow-lg transition-shadow duration-300
                    ${isActive ? `${a.border} ${a.ring}` : 'border-gray-100 dark:border-gray-800'}`}>
                  {plan.badge && !isActive && (
                    <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full ${a.badge}`}>
                      {plan.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full
                                     bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      Active
                    </span>
                  )}
                  <div className="pt-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{plan.label}</h3>
                    <div className="flex items-end gap-1.5 mt-1">
                      <span className={`text-5xl font-extrabold leading-none ${a.text}`}>{plan.premiumPct}%</span>
                      <span className="text-sm text-gray-400 mb-1">of weekly income</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">e.g. ₹{calc.premium}/week on ₹7,000 income</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <Box className="!p-3">
                      <p className="text-xs text-gray-400">Hour Threshold</p>
                      <p className="font-bold text-gray-800 dark:text-white">{plan.hourThreshold} hrs</p>
                    </Box>
                    <Box className="!p-3">
                      <p className="text-xs text-gray-400">Max Weekly Payout</p>
                      <p className="font-bold text-gray-800 dark:text-white">₹{plan.maxPayout.toLocaleString()}</p>
                    </Box>
                    <Box className="col-span-2 !p-3">
                      <p className="text-xs text-gray-400">Day Claim</p>
                      <p className="font-bold text-gray-800 dark:text-white">6 × hourly income</p>
                    </Box>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Covered Events</p>
                    <ul className="space-y-1.5">
                      {EVENTS.map(({ Icon, label }) => (
                        <li key={label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Icon size={14} className="text-gray-400 shrink-0" />{label}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button onClick={() => setSelectedPlan(key)} disabled={isActive}
                    className={`mt-auto w-full py-3 rounded-2xl font-semibold text-white transition-all duration-200
                      ${isActive ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed' : `${a.btn} shadow-md hover:shadow-lg`}`}>
                    {isActive ? 'Current Plan' : 'Select Plan →'}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">How Compensation is Calculated</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Payouts are based on your actual earnings — not a fixed amount.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { Icon: Calculator,   bg: 'bg-blue-50 dark:bg-blue-900/30',   title: 'Hourly Income', desc: 'Previous Week Income ÷ 42 hrs (6 hrs/day × 7 days)', mono: A.blue.mono,   code: '₹7,000 ÷ 42 ≈ ₹166/hr' },
              { Icon: CalendarDays, bg: 'bg-violet-50 dark:bg-violet-900/30', title: 'Day Claim',    desc: "If you can't work the entire day: Payout = 6 × Hourly Income", mono: A.violet.mono, code: '6 × ₹166 ≈ ₹996/day' },
              { Icon: Clock,        bg: 'bg-amber-50 dark:bg-amber-900/30',  title: 'Hour Claim',   desc: 'Lost hours accumulate until threshold. Payout = Threshold × Hourly Income', mono: A.amber.mono, code: 'Basic: 8 hrs · Standard: 6 hrs · Premium: 4 hrs' },
            ].map(({ Icon, bg, title, desc, mono, code }) => (
              <div key={title} className="card border border-gray-100 dark:border-gray-800 space-y-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon size={20} className="text-gray-600 dark:text-gray-300" />
                </div>
                <p className="font-semibold text-gray-800 dark:text-white text-sm">{title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                <div className={`rounded-xl px-3 py-2 text-xs font-mono ${mono}`}>{code}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <PolicyPage key={selectedPlan} planKey={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
