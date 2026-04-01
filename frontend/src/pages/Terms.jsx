import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScrollText, ArrowLeft } from 'lucide-react';

const SECTIONS = [
  {
    title: '1. Coverage Eligibility',
    content: 'Coverage is available to registered gig delivery workers on supported platforms (Zomato, Swiggy, Uber Eats, Amazon, Zepto, Blinkit). Workers must complete onboarding and pay the weekly premium to activate coverage.',
  },
  {
    title: '2. Premium Calculation',
    content: 'The weekly premium is calculated as a percentage of your previous week\'s income. Basic: 5%, Standard: 8%, Premium: 10%. Premium must be paid every 7 days to maintain active coverage.',
  },
  {
    title: '3. Claim Eligibility',
    content: 'Claims are automatically triggered when environmental disruptions (heavy rain >50mm/hr, extreme heat >42°C, AQI >300, severe traffic) are detected in your registered city. Coverage must be active at the time of disruption.',
  },
  {
    title: '4. Payout Calculation',
    content: 'Hourly Income = Weekly Income ÷ Working Hours per Day. Claim Amount = 6 × Hourly Income. Payouts are capped at the plan\'s maximum weekly payout limit.',
  },
  {
    title: '5. Fraud Prevention',
    content: 'All claims are subject to automated fraud detection. Suspicious claims will be flagged for manual review. Fraudulent claims will result in account suspension and legal action.',
  },
  {
    title: '6. Data & Privacy',
    content: 'Location data is collected during work hours solely to verify disruption events and working hours. Data is encrypted and never shared with third parties without consent.',
  },
  {
    title: '7. Grace Period',
    content: 'A 1-day grace period is provided after coverage expiry. Claims submitted during the grace period are valid. Coverage lapses permanently after the grace period if premium is not renewed.',
  },
  {
    title: '8. Dispute Resolution',
    content: 'Disputes must be raised within 7 days of claim decision. DeliverGuard AI will review and respond within 3 business days. Final decisions are binding.',
  },
];

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2 rounded-xl">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <ScrollText size={20} /> Terms & Conditions
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">DeliverGuard AI Insurance Policy — Last updated March 2026</p>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card space-y-2"
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{s.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>

      <button onClick={() => navigate(-1)} className="btn-primary w-full py-3">
        I Understand — Go Back
      </button>
    </div>
  );
}
