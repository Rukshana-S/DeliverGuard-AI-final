import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShieldCheck, CreditCard, ScrollText,
  Radio, Wallet, BarChart2, UserCircle,
  Settings, HardHat, ClipboardList, FileText,
  Banknote, Zap, TrendingUp, FolderOpen,
  TrafficCone, ShieldAlert, Trophy, Menu, X,
} from 'lucide-react';

const WORKER_LINKS = [
  { to: '/dashboard',                 label: 'Dashboard',        Icon: LayoutDashboard },
  { to: '/coverage',                  label: 'My Coverage',      Icon: ShieldCheck },
  { to: '/upload-salary-proof',       label: 'Pay Premium',      Icon: CreditCard },
  { to: '/insurance-payment-history', label: 'Payment History',  Icon: ScrollText },
  { to: '/monitoring',                label: 'Live Monitoring',  Icon: Radio },
  { to: '/claims',                    label: 'Claims & Payouts', Icon: Wallet },
  { to: '/analytics',                 label: 'Risk Analytics',   Icon: BarChart2 },
  { to: '/leaderboard',               label: 'Leaderboard',      Icon: Trophy },
  { to: '/profile',                   label: 'Profile',          Icon: UserCircle },
];

const ADMIN_LINKS = [
  { to: '/admin',             label: 'Admin Dashboard', Icon: Settings },
  { to: '/admin/users',       label: 'Workers',         Icon: HardHat },
  { to: '/admin/claims',      label: 'Manage Claims',   Icon: ClipboardList },
  { to: '/admin/policies',    label: 'Policies',        Icon: FileText },
  { to: '/admin/payouts',     label: 'Payouts',         Icon: Banknote },
  { to: '/admin/disruptions', label: 'Disruptions',     Icon: Zap },
  { to: '/admin/analytics',   label: 'Analytics',       Icon: TrendingUp },
  { to: '/admin/logs',        label: 'System Logs',     Icon: FolderOpen },
  { to: '/admin/traffic',     label: 'TN Traffic',      Icon: TrafficCone },
  { to: '/admin/fraud',       label: 'Fraud Alerts',    Icon: ShieldAlert },
];

function NavItem({ to, label, Icon, isAdmin, onClick }) {
  const active = isAdmin
    ? 'bg-red-50 dark:bg-red-900/30 text-red-600'
    : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600';
  return (
    <NavLink
      to={to}
      end={to === '/admin'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive
            ? active
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`
      }
    >
      <Icon size={16} />
      {label}
    </NavLink>
  );
}

function SidebarContent({ isAdmin, navLinks, user, onLogout, onClose }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="font-bold text-blue-600">DeliverGuard</p>
            <p className="text-xs text-gray-400">{isAdmin ? 'Admin Panel' : 'AI Insurance'}</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={20} className="text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map(({ to, label, Icon }) => (
          <NavItem key={to} to={to} label={label} Icon={Icon} isAdmin={isAdmin} onClick={onClose} />
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            isAdmin ? 'bg-red-100 dark:bg-red-900 text-red-600' : 'bg-blue-100 dark:bg-blue-900 text-blue-600'
          }`}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className={`text-xs capitalize font-medium ${isAdmin ? 'text-red-400' : 'text-gray-400'}`}>
              {user?.role}
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full btn-secondary text-sm">Logout</button>
      </div>
    </div>
  );
}

// Export toggle function via a simple event so Navbar can trigger it
export let openSidebar = () => {};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = user?.role === 'admin';
  const navLinks = isAdmin ? ADMIN_LINKS : WORKER_LINKS;

  openSidebar = () => setMobileOpen(true);

  const handleLogout = () => { logout(); navigate('/login'); };
  const close = () => setMobileOpen(false);

  return (
    <>
      {/* ── Desktop sidebar (always visible ≥ lg) ── */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col shrink-0">
        <SidebarContent isAdmin={isAdmin} navLinks={navLinks} user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile drawer overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 flex flex-col shadow-2xl lg:hidden"
            >
              <SidebarContent isAdmin={isAdmin} navLinks={navLinks} user={user} onLogout={handleLogout} onClose={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
