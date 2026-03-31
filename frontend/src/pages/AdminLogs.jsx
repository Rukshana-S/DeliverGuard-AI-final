import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

const MODULE_BADGE = {
  Claims:  'bg-blue-100 text-blue-700',
  Payouts: 'bg-green-100 text-green-700',
  Fraud:   'bg-red-100 text-red-700',
};

const STATUS_BADGE = {
  pending:    'bg-yellow-100 text-yellow-700',
  approved:   'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
  paid:       'bg-blue-100 text-blue-700',
  success:    'bg-green-100 text-green-700',
  failed:     'bg-red-100 text-red-700',
  alert:      'bg-orange-100 text-orange-700',
  investigating: 'bg-purple-100 text-purple-700',
};

export default function AdminLogs() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [module, setModule]   = useState('all');

  useEffect(() => {
    api.get('/admin/logs')
      .then((r) => setLogs(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const modules  = ['all', 'Claims', 'Payouts', 'Fraud'];
  const filtered = module === 'all' ? logs : logs.filter((l) => l.module === module);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {['Claims', 'Payouts', 'Fraud'].map((m) => (
          <div key={m} className="card text-center">
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">
              {logs.filter((l) => l.module === m).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">{m} Events</p>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Module filter */}
        <div className="flex items-center gap-3 mb-4">
          {modules.map((m) => (
            <button key={m} onClick={() => setModule(m)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                module === m ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {m === 'all' ? 'All Modules' : m}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} entries</span>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No logs found</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${MODULE_BADGE[log.module] || 'bg-gray-100 text-gray-700'}`}>
                    {log.module}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{log.event}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_BADGE[log.status] || 'bg-gray-100 text-gray-700'}`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{log.desc}</p>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400 whitespace-nowrap">
                  {new Date(log.ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
