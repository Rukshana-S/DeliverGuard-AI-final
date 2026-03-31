import { motion } from 'framer-motion';
import { Gem, Star, Award } from 'lucide-react';

const TIERS = [
  {
    id: 'silver',
    label: 'Silver',
    Icon: Star,
    badge: null,
    scale: false,
    perks: ['Basic claim support', 'Standard payout speed', 'Email notifications'],
    highlight: '₹500/day',
    sub: 'Daily Coverage',
    cardCls: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconCls: 'text-gray-400',
    labelCls: 'text-gray-500 dark:text-gray-400',
    valueCls: 'text-gray-800 dark:text-white',
    perkCls: 'text-gray-500 dark:text-gray-400',
    dotCls: 'bg-gray-300 dark:bg-gray-600',
    btnCls: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
    glow: '',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    Icon: Gem,
    badge: 'TOP TIER',
    scale: true,
    perks: ['Priority claim processing', 'Instant payout (2 hrs)', 'Dedicated support', '24/7 live monitoring'],
    highlight: '₹2000/day',
    sub: 'Daily Coverage',
    cardCls: 'bg-gradient-to-b from-[#1a3a6e] via-[#1e4080] to-[#0f2a5c] border border-blue-400/30',
    iconBg: 'bg-blue-500/20',
    iconCls: 'text-blue-300',
    labelCls: 'text-blue-200',
    valueCls: 'text-white',
    perkCls: 'text-blue-200',
    dotCls: 'bg-blue-400',
    btnCls: 'bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/30',
    glow: '0 0 40px 8px rgba(59,130,246,0.35), 0 8px 32px rgba(30,64,128,0.5)',
  },
  {
    id: 'gold',
    label: 'Gold',
    Icon: Award,
    badge: null,
    scale: false,
    perks: ['Fast claim processing', 'Same-day payout', 'SMS + Email alerts'],
    highlight: '₹1000/day',
    sub: 'Daily Coverage',
    cardCls: 'bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-[#2a1f00] dark:to-[#1a1400] border border-amber-300/60 dark:border-amber-600/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconCls: 'text-amber-500',
    labelCls: 'text-amber-600 dark:text-amber-400',
    valueCls: 'text-gray-900 dark:text-amber-100',
    perkCls: 'text-amber-700 dark:text-amber-300',
    dotCls: 'bg-amber-400',
    btnCls: 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-white shadow-md shadow-amber-300/30',
    glow: '',
  },
];

// Display order: Silver (left) → Diamond (center) → Gold (right)
const DISPLAY_ORDER = ['silver', 'diamond', 'gold'];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function RewardTiers() {
  return (
    <section>
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">Membership Tiers</p>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Choose Your Protection Level</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Higher tiers unlock faster payouts and priority support</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-5 px-2"
      >
        {DISPLAY_ORDER.map((id) => { const tier = TIERS.find(t => t.id === id); return (
          <motion.div
            key={tier.id}
            variants={cardVariants}
            whileHover={{ y: tier.scale ? -10 : -6, transition: { duration: 0.2 } }}
            style={tier.glow ? { boxShadow: tier.glow } : {}}
            className={`
              relative rounded-3xl flex flex-col gap-5 transition-all duration-300
              ${tier.cardCls}
              ${tier.scale
                ? 'w-full md:w-72 px-7 py-8 z-10'
                : 'w-full md:w-60 px-6 py-7'}
            `}
          >
            {/* TOP TIER badge */}
            {tier.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-[10px] font-extrabold tracking-widest uppercase px-4 py-1 rounded-full shadow-lg shadow-blue-500/40">
                  {tier.badge}
                </span>
              </div>
            )}

            {/* Icon + Label */}
            <div className="flex items-center gap-3 mt-1">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tier.iconBg}`}>
                <tier.Icon size={20} className={tier.iconCls} />
              </div>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${tier.labelCls}`}>{tier.label}</p>
                <p className={`text-xl font-extrabold leading-tight ${tier.valueCls}`}>{tier.highlight}</p>
                <p className={`text-xs ${tier.perkCls}`}>{tier.sub}</p>
              </div>
            </div>

            {/* Divider */}
            <div className={`h-px w-full ${tier.scale ? 'bg-blue-500/20' : 'bg-gray-100 dark:bg-gray-800'}`} />

            {/* Perks */}
            <ul className="space-y-2.5">
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tier.dotCls}`} />
                  <span className={`text-sm ${tier.perkCls}`}>{perk}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button className={`w-full py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${tier.btnCls}`}>
              {tier.scale ? 'Get Diamond →' : `Get ${tier.label} →`}
            </button>
          </motion.div>
        ); })}
      </motion.div>
    </section>
  );
}
