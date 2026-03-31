import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    green:  'bg-green-50 dark:bg-green-900/20 text-green-600',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600',
    red:    'bg-red-50 dark:bg-red-900/20 text-red-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex items-center gap-4"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </motion.div>
  );
}
