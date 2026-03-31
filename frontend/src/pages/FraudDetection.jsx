import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';

const FRAUD_COLORS = {
  gps_spoof: 'bg-red-100 text-red-700',
  duplicate_claim: 'bg-orange-100 text-orange-700',
  api_mismatch: 'bg-yellow-100 text-yellow-700',
  abnormal_frequency: 'bg-purple-100 text-purple-700',
};

export default function FraudDetection() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/fraud-alerts').then((r) => setAlerts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Fraud Alerts</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-600">{alerts.filter((a) => a.riskScore > 80).length}</p>
          <p className="text-sm text-gray-500 mt-1">High Risk (Score &gt; 80)</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-purple-600">{alerts.filter((a) => a.fraudType === 'duplicate_claim').length}</p>
          <p className="text-sm text-gray-500 mt-1">Duplicate Claims</p>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : alerts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No fraud alerts detected</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Worker</th>
                <th className="pb-3 pr-4">Fraud Type</th>
                <th className="pb-3 pr-4">Risk Score</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3">Claim ID</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <motion.tr key={a._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="py-3 pr-4">{a.userId?.name || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${FRAUD_COLORS[a.fraudType] || 'bg-gray-100 text-gray-700'}`}>
                      {a.fraudType?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${a.riskScore}%` }} />
                      </div>
                      <span className="font-semibold text-red-600">{a.riskScore}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{formatDate(a.timestamp)}</td>
                  <td className="py-3 font-mono text-xs text-gray-400">{a.claimId?._id?.slice(-8) || '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
