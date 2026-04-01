import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, Zap, CalendarDays, Bot, CloudRain, Thermometer,
  Wind, Car, Users, Building2, CheckCircle, XCircle,
  Award, Fuel, Clock, Lock, Eye, AlertTriangle, ChevronDown,
  ArrowRight, Upload, BarChart2, Banknote, Star,
  Umbrella, Gauge, Leaf, Landmark, HandMetal, Timer,
  UserX, HeartOff, FileX, WifiOff, SunDim, Skull, Gem,
} from 'lucide-react';

/* ─── Data ─────────────────────────────────────────────── */

const STEPS = [
  { icon: Upload,     title: 'Upload Income Proof',       desc: 'Submit your weekly earnings proof securely.' },
  { icon: ShieldCheck,title: 'Choose Insurance Plan',     desc: 'Pick a plan that fits your income level.' },
  { icon: Bot,        title: 'AI Monitors Disruptions',   desc: 'Our system tracks weather, AQI, and traffic 24/7.' },
  { icon: Banknote,   title: 'Receive Automatic Payout',  desc: 'Get compensated directly to your bank account.' },
];

const PLANS = [
  { name: 'Basic',    premium: '5%',  payout: '₹2,000', color: 'border-blue-400',   badge: 'bg-blue-100 text-blue-700',   popular: false },
  { name: 'Standard', premium: '8%',  payout: '₹4,000', color: 'border-indigo-500', badge: 'bg-indigo-100 text-indigo-700', popular: true  },
  { name: 'Premium',  premium: '10%', payout: '₹8,000', color: 'border-purple-500', badge: 'bg-purple-100 text-purple-700', popular: false },
];

const COVERED = [
  { icon: Umbrella,   title: 'Income Loss Due to Weather',       desc: 'Covers income loss when heavy rain, floods, or extreme weather prevent delivery work.' },
  { icon: Gauge,      title: 'Traffic Disruptions',              desc: 'Provides compensation when severe traffic congestion significantly reduces working hours.' },
  { icon: Leaf,       title: 'Environmental Disturbances',       desc: 'Covers disruptions caused by pollution, extreme heat, or unsafe working conditions.' },
  { icon: Landmark,   title: 'Government Restrictions',          desc: 'Covers income loss during lockdowns, curfews, or restricted movement orders.' },
  { icon: HandMetal,  title: 'Strike / Bandh Impact',            desc: 'Compensates for loss of work due to public strikes or bandh situations affecting delivery operations.' },
  { icon: Timer,      title: 'Partial Work Loss (Hourly Claims)', desc: 'If work hours are reduced due to disruptions, payout is calculated based on lost hours.' },
];

const NOT_COVERED = [
  { icon: UserX,   title: 'Voluntary Leave',                  desc: 'No compensation if the worker chooses not to work without any external disruption.' },
  { icon: HeartOff,title: 'Personal Reasons',                 desc: 'Absence due to personal commitments or non-work-related issues is not covered.' },
  { icon: FileX,   title: 'Fake or Manipulated Claims',       desc: 'Any attempt to submit false income proof or manipulated data will result in rejection.' },
  { icon: WifiOff, title: 'Inactive Work Status',             desc: 'If the worker is not actively working or logged in during the disruption, claims are not valid.' },
  { icon: SunDim,  title: 'Normal Working Conditions',        desc: 'Regular days without disruptions are not eligible for any claim.' },
  { icon: Skull,   title: 'Accidental Death or Personal Injury', desc: 'This platform does not provide life insurance or accident coverage such as death benefits or injury compensation.' },
];



const TRUST = [
  { icon: Bot,          title: 'AI-Based Monitoring',   desc: 'Real-time disruption detection using weather, AQI & traffic APIs.' },
  { icon: Lock,         title: 'Secure Payouts',        desc: 'Bank-grade encryption for every transaction.' },
  { icon: AlertTriangle,title: 'Fraud Detection',       desc: 'ML-powered fraud scoring on every claim.' },
  { icon: Eye,          title: 'Transparent System',    desc: 'Full claim history and audit trail available to you.' },
];

const FAQS = [
  {
    q: 'What does the insurance cover?',
    a: 'The insurance covers income loss due to disruptions like heavy rain, traffic, or poor air quality. When these conditions exceed set limits, payouts are triggered automatically. It helps gig workers stay financially secure. No manual claim is required.',
  },
  {
    q: 'When will I receive my payout?',
    a: 'Payouts are processed instantly once a disruption is detected and verified. The system automatically credits the amount to your account. In most cases, it takes only a few minutes. No manual steps are involved.',
  },
  {
    q: 'How much does it cost?',
    a: 'The cost depends on the plan you choose. We offer affordable micro-premium options for daily or weekly coverage. Plans are designed to be budget-friendly for gig workers. You can upgrade anytime.',
  },
  {
    q: 'Do I need to submit any documents?',
    a: 'No documents are required for claims. The system uses real-time data to detect disruptions. Everything is verified automatically. This makes the process fast and hassle-free.',
  },
  {
    q: 'Can I change or cancel my plan?',
    a: 'Yes, you can change or cancel your plan anytime. Updates can be done directly from your dashboard. Changes will reflect in the next billing cycle. It gives full flexibility to users.',
  },
  {
    q: 'What if I choose not to work on a bad day?',
    a: 'You are still eligible for payouts if a disruption occurs. It does not depend on whether you worked or not. The system checks environmental conditions only. This ensures fair coverage.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'Yes, your data is fully secure and encrypted. We follow strict security standards. Your information is never shared without consent. Privacy is a top priority.',
  },
  {
    q: 'Do I need to file a claim manually?',
    a: 'No manual claim is needed. The system automatically detects disruptions. Once verified, payouts are triggered instantly. This removes delays and effort for users.',
  },
];

/* ─── Sub-components ────────────────────────────────────── */

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
      isOpen ? 'border-indigo-200 bg-white shadow-sm' : 'border-gray-200 bg-white'
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <span className={`text-sm font-semibold ${isOpen ? 'text-indigo-700' : 'text-gray-800'}`}>{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 ml-3 transition-transform duration-300 ${
            isOpen ? 'rotate-180 text-indigo-500' : 'text-gray-400'
          }`}
        />
      </button>
      <div
        style={{
          maxHeight: isOpen ? '200px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <p className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
          {a}
        </p>
      </div>
    </div>
  );
}

function FAQList() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <FAQItem
          key={faq.q}
          q={faq.q}
          a={faq.a}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
      {children}
    </span>
  );
}

/* ─── Loyalty Section ─────────────────────────────────────── */

const TIER_STYLES = {
  Gold: {
    card:       'linear-gradient(145deg, rgba(255,248,220,0.92) 0%, rgba(251,191,36,0.18) 100%)',
    border:     '1px solid rgba(251,191,36,0.55)',
    glow:       null,
    iconBg:     'linear-gradient(135deg,#fbbf24,#f59e0b)',
    iconColor:  '#fff',
    iconShadow: '0 0 20px rgba(251,191,36,0.65)',
    Icon:       Award,
    titleColor: '#92400e',
    subColor:   '#b45309',
    perkColor:  '#78350f',
    perkDot:    '#f59e0b',
    subtitle:   '6 months active',
    perks:      ['Priority claim queue', 'Fuel cashback 2x', 'Dedicated support'],
    progress:   { label: 'Progress to Diamond', pct: 55, trackBg: 'rgba(251,191,36,0.2)', fillBg: 'linear-gradient(90deg,#fbbf24,#f59e0b)' },
    btnBg:      'linear-gradient(90deg,#fbbf24,#f59e0b)',
    btnColor:   '#fff',
    dominant:   false,
  },
  Diamond: {
    card:       'linear-gradient(145deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%)',
    border:     '1px solid rgba(96,165,250,0.5)',
    glow:       '0 0 56px 12px rgba(37,99,235,0.4), 0 20px 56px rgba(29,78,216,0.45)',
    iconBg:     'rgba(255,255,255,0.18)',
    iconColor:  '#fff',
    iconShadow: '0 0 22px rgba(255,255,255,0.35)',
    Icon:       Gem,
    titleColor: '#fff',
    subColor:   'rgba(191,219,254,0.9)',
    perkColor:  'rgba(219,234,254,0.95)',
    perkDot:    'rgba(147,197,253,0.9)',
    badge:      'TOP TIER',
    badgeBg:    'linear-gradient(90deg,#1d4ed8,#2563eb)',
    badgeColor: '#fff',
    subtitle:   '12 months active',
    perks:      ['Instant payouts', 'Fuel cashback 5x', 'Zero fraud holds'],
    progress:   null,
    btnBg:      'rgba(255,255,255,0.18)',
    btnColor:   '#fff',
    dominant:   true,
  },
  Silver: {
    card:       'linear-gradient(145deg,rgba(255,255,255,0.88) 0%,rgba(226,232,240,0.55) 100%)',
    border:     '1px solid rgba(203,213,225,0.7)',
    glow:       null,
    iconBg:     'linear-gradient(135deg,#e2e8f0,#cbd5e1)',
    iconColor:  '#94a3b8',
    iconShadow: '0 0 14px rgba(148,163,184,0.4)',
    Icon:       Star,
    titleColor: '#334155',
    subColor:   '#64748b',
    perkColor:  '#475569',
    perkDot:    '#94a3b8',
    badge:      null,
    subtitle:   '3 months active',
    perks:      ['Basic claim processing', 'Weekly reports'],
    progress:   null,
    btnBg:      '#f1f5f9',
    btnColor:   '#64748b',
    dominant:   false,
  },
};

const TIER_ORDER = ['Gold', 'Diamond', 'Silver'];

function LoyaltySection() {
  return (
    <section
      className="relative py-24 px-6 overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#f0f4ff 0%,#faf5ff 40%,#eff6ff 70%,#f8faff 100%)' }}
    >
      {/* bokeh blobs */}
      <div style={{ position:'absolute', top:'-80px', left:'-60px', width:'440px', height:'440px', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,0.2) 0%,transparent 70%)', filter:'blur(48px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-60px', right:'-80px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle,rgba(96,165,250,0.18) 0%,transparent 70%)', filter:'blur(48px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.1) 0%,transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
      {/* floating particles */}
      {[{top:'12%',left:'8%',s:6,o:0.25},{top:'25%',right:'6%',s:4,o:0.2},{top:'70%',left:'5%',s:5,o:0.18},{bottom:'15%',right:'10%',s:7,o:0.22},{top:'50%',left:'92%',s:4,o:0.15}].map((p,i) => (
        <div key={i} style={{ position:'absolute', top:p.top, left:p.left, right:p.right, bottom:p.bottom, width:`${p.s}px`, height:`${p.s}px`, borderRadius:'50%', background:`rgba(139,92,246,${p.o})`, pointerEvents:'none' }} />
      ))}

      <div className="relative max-w-5xl mx-auto">
        {/* header */}
        <div className="text-center mb-14">
          <span style={{ display:'inline-block', fontSize:'10px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#7c3aed', background:'linear-gradient(90deg,rgba(167,139,250,0.18),rgba(139,92,246,0.12))', border:'1px solid rgba(139,92,246,0.25)', padding:'4px 14px', borderRadius:'999px', marginBottom:'16px' }}>Loyalty</span>
          <h2 style={{ fontSize:'clamp(1.75rem,4vw,2.5rem)', fontWeight:800, background:'linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#1d4ed8 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text', lineHeight:1.2, marginBottom:'12px' }}>Rewards for Staying Protected</h2>
          <p style={{ color:'#64748b', fontSize:'0.95rem' }}>The longer you stay, the more you earn.</p>
        </div>

        {/* tier cards — Gold | Diamond | Silver */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-stretch mb-10">
          {TIER_ORDER.map((key) => {
            const t = TIER_STYLES[key];
            return (
              <div
                key={key}
                style={{
                  background: t.card,
                  border: t.border,
                  boxShadow: t.glow ?? '0 8px 32px rgba(0,0,0,0.07)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  borderRadius: '24px',
                  padding: t.dominant ? '44px 28px 36px' : '32px 24px 28px',
                  position: 'relative',
                  transform: t.dominant ? 'scale(1.06)' : 'none',
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'default',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = t.dominant ? 'scale(1.09)' : 'translateY(-6px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = t.dominant ? 'scale(1.06)' : 'none'; }}
              >
                {/* light reflection overlay */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'50%', background:'linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%)', borderRadius:'24px 24px 0 0', pointerEvents:'none' }} />

                {/* TOP TIER badge (Diamond only) */}
                {t.badge && (
                  <div style={{ position:'absolute', top:'14px', right:'14px', zIndex:10 }}>
                    <span style={{ background:t.badgeBg, color:t.badgeColor, fontSize:'9px', fontWeight:800, letterSpacing:'0.15em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'999px', boxShadow:'0 4px 12px rgba(37,99,235,0.4)', whiteSpace:'nowrap' }}>
                      {t.badge}
                    </span>
                  </div>
                )}

                {/* icon */}
                <div style={{ width:'62px', height:'62px', borderRadius:'50%', background:t.iconBg, boxShadow:t.iconShadow, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px' }}>
                  <t.Icon size={27} style={{ color: t.iconColor }} />
                </div>

                {/* title */}
                <p style={{ textAlign:'center', fontSize:'1rem', fontWeight:800, color:t.titleColor, marginBottom:'4px' }}>
                  {key} Member
                </p>

                {/* subtitle */}
                <p style={{ textAlign:'center', fontSize:'0.75rem', color:t.subColor, marginBottom:'18px' }}>
                  {t.subtitle}
                </p>

                {/* perks */}
                <ul style={{ listStyle:'none', padding:0, margin:'0 0 20px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  {t.perks.map((perk) => (
                    <li key={perk} style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'0.8rem', color:t.perkColor }}>
                      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:t.perkDot, flexShrink:0 }} />
                      {perk}
                    </li>
                  ))}
                </ul>




              </div>
            );
          })}
        </div>

        {/* feature boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: Fuel,  title: 'Fuel Rewards',              desc: 'Earn fuel cashback credits on every active week. Gold members get 2x, Diamond gets 5x.', iconBg:'linear-gradient(135deg,#fbbf24,#f59e0b)', iconColor:'#fff' },
            { icon: Clock, title: 'Faster Claim Processing',   desc: 'Priority queue for Gold and Diamond members. Claims resolved in under 12 hours.',          iconBg:'linear-gradient(135deg,#6366f1,#4f46e5)', iconColor:'#fff' },
          ].map(({ icon: Icon, title, desc, iconBg, iconColor }) => (
            <div key={title} style={{ background:'rgba(255,255,255,0.75)', border:'1px solid rgba(203,213,225,0.6)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', borderRadius:'18px', padding:'24px', display:'flex', gap:'16px', alignItems:'flex-start', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', transition:'transform 0.2s ease, box-shadow 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.05)'; }}
            >
              <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(0,0,0,0.12)' }}>
                <Icon size={20} style={{ color: iconColor }} />
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:'0.9rem', color:'#1e293b', marginBottom:'5px' }}>{title}</p>
                <p style={{ fontSize:'0.8rem', color:'#64748b', lineHeight:1.55 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Know Your Coverage ───────────────────────────────── */

function KnowYourCoverage() {
  const [tab, setTab] = useState('covered');
  const isCovered = tab === 'covered';
  const items = isCovered ? COVERED : NOT_COVERED;

  return (
    <section className="py-20 px-6" style={{ background: '#f5f7fb' }}>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <SectionLabel>Coverage</SectionLabel>
          <h2 className="text-3xl font-bold mb-2">Know Your Coverage</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Understand exactly what DeliverGuard AI protects you from — and what falls outside the policy.
          </p>
        </div>

        {/* Toggle Pills */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1">
            <button
              onClick={() => setTab('covered')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isCovered
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <CheckCircle size={15} />
                What's Covered?
              </span>
            </button>
            <button
              onClick={() => setTab('not-covered')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                !isCovered
                  ? 'bg-gray-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <XCircle size={15} />
                What's Not Covered?
              </span>
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isCovered ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <Icon size={20} className={isCovered ? 'text-green-600' : 'text-red-500'} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom hint */}
        <p className="text-center text-xs text-gray-400 mt-8">
          {isCovered
            ? '✓ All covered events are verified in real-time by our AI monitoring system.'
            : '✗ Excluded events are determined by policy terms and AI fraud detection.'}
        </p>
      </div>
    </section>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Navbar ── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">🛡️ DeliverGuard AI</span>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
            <Link to="/register" className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── SECTION 1: Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden text-white" style={{ backgroundImage: "url('/image.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <Zap size={13} /> AI-Powered Parametric Insurance
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-5">
            Protect Your Income.<br />Ride Without Fear.
          </h1>
          <p className="text-lg text-indigo-100 mb-8 max-w-xl mx-auto">
            AI-powered insurance for delivery partners. Get compensated when disruptions affect your work.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-indigo-700 font-semibold px-7 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Get Started <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-medium px-7 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Login
            </Link>
          </div>

          {/* Highlights */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {[
              { icon: Zap,         label: 'Instant Claims' },
              { icon: CalendarDays,label: 'Weekly Plans'   },
              { icon: Bot,         label: 'AI Monitoring'  },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/20 px-5 py-2.5 rounded-xl text-sm font-medium">
                <Icon size={16} className="text-indigo-200" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Problem Statement ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <SectionLabel>The Problem</SectionLabel>
          <h2 className="text-3xl font-bold mb-4">Why Delivery Workers Need Protection</h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-12">
            Gig workers are the backbone of urban delivery — yet they have zero safety net when the unexpected hits.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: CloudRain,  title: 'Unpredictable Rain',    desc: 'Heavy rain forces workers off the road, cutting daily earnings to zero with no compensation.' },
              { icon: Car,        title: 'Severe Traffic Jams',   desc: 'Gridlocked roads mean fewer deliveries, lower ratings, and lost income — every single day.' },
              { icon: AlertTriangle, title: 'Sudden Disruptions', desc: 'Strikes, bandhs, and environmental hazards can shut down entire cities without warning.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-left">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-red-500" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: How It Works ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="text-3xl font-bold mb-12">Four Simple Steps to Coverage</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative bg-gray-50 rounded-2xl p-6 text-left border border-gray-100">
                <span className="absolute top-4 right-4 text-xs font-bold text-gray-300">0{i + 1}</span>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Plans ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h2 className="text-3xl font-bold mb-3">Insurance Plans</h2>
          <p className="text-gray-500 mb-12">Weekly premiums. Automatic payouts. No paperwork.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {PLANS.map(({ name, premium, payout, color, badge, popular }) => (
              <div key={name} className={`relative bg-white rounded-2xl p-7 shadow-sm border-2 ${color} flex flex-col`}>
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full mb-4 ${badge}`}>{name} Plan</span>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">{premium}</div>
                <div className="text-sm text-gray-400 mb-5">of weekly income as premium</div>
                <div className="text-2xl font-bold text-indigo-700 mb-1">{payout}</div>
                <div className="text-sm text-gray-400 mb-7">weekly payout limit</div>
                <Link to="/register" className="mt-auto block text-center bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                  Choose {name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: Know Your Coverage ── */}
      <KnowYourCoverage />

      {/* ── SECTION 6: Loyalty Benefits ── */}
      <LoyaltySection />

      {/* ── SECTION 7: Trust ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <SectionLabel>Why Trust Us</SectionLabel>
          <h2 className="text-3xl font-bold mb-12">Built for Transparency & Security</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-left">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
            <p className="text-gray-500 text-sm mt-2">Everything you need to know about DeliverGuard AI.</p>
          </div>
          <FAQList />
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0f172a' }} className="text-gray-400">
        {/* Main footer grid */}
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Left — Brand */}
          <div>
            <div className="text-white text-lg font-bold mb-3">🛡️ DeliverGuard AI</div>
            <p className="text-sm leading-relaxed text-gray-400">
              AI-powered insurance for delivery partners. Get compensated when disruptions affect your work.
            </p>
          </div>

          {/* Center — Nav links */}
          <div className="sm:text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Navigation</div>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Home',     href: '/'         },
                { label: 'Coverage', href: '/coverage' },
                { label: 'Plans',    href: '/register' },
                { label: 'FAQ',      href: '/'         },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Auth links */}
          <div className="sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">Account</div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login"    className="hover:text-white transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Register</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-5 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} DeliverGuard AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
