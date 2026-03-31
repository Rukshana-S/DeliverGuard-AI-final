import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';
import { motion } from 'framer-motion';
import { CloudRain, Thermometer, Wind, TrafficCone } from 'lucide-react';

const TYPE_BADGE = {
  heavy_rain:   'bg-blue-100 text-blue-700',
  extreme_heat: 'bg-orange-100 text-orange-700',
  aqi_hazard:   'bg-purple-100 text-purple-700',
  traffic_jam:  'bg-yellow-100 text-yellow-700',
};

const TYPE_ICON = {
  heavy_rain:   CloudRain,
  extreme_heat: Thermometer,
  aqi_hazard:   Wind,
  traffic_jam:  TrafficCone,
};

export default function AdminDisruptions() {
  const [disruptions, setDisruptions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    api.get('/admin/disruptions')
      .then((r) => setDisruptions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const types = ['all', 'heavy_rain', 'extreme_heat', 'aqi_hazard', 'traffic_jam'];

  const filtered = filter === 'all'
    ? disruptions
    : disruptions.filter((d) => d._id?.type === filter);

  const totalAffected = disruptions.reduce((s, d) => s + (d.affectedWorkers || 0), 0);
  const totalLoss     = disruptions.reduce((s, d) => s + (d.totalLoss || 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events',      value: disruptions.length,                    color: 'text-blue-600' },
          { label: 'Affected Workers',  value: totalAffected,                         color: 'text-orange-600' },
          { label: 'Total Income Loss', value: `₹${totalLoss.toLocaleString('en-IN')}`, color: 'text-red-600' },
          { label: 'Active Cities',     value: new Set(disruptions.map((d) => d._id?.city)).size, color: 'text-purple-600' },
        ].map((c) => (
          <div key={c.label} className="card text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter + Table */}
      <div className="card overflow-x-auto">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {types.map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button key={t} onClick={() => setFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}>
                {Icon && <Icon size={12} />}
                {t === 'all' ? 'All Types' : t.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No disruption events found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">Event Type</th>
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Affected Workers</th>
                <th className="pb-3">Total Loss</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="py-3 pr-4">
                    {(() => { const Icon = TYPE_ICON[d._id?.type]; return (
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs capitalize ${TYPE_BADGE[d._id?.type] || 'bg-gray-100 text-gray-700'}`}>
                        {Icon && <Icon size={11} />}
                        {d._id?.type?.replace(/_/g, ' ') || '—'}
                      </span>
                    ); })()}
                  </td>
                  <td className="py-3 pr-4 font-medium">{d._id?.city || '—'}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500">{d._id?.date || '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="font-semibold text-orange-600">{d.affectedWorkers}</span>
                    <span className="text-gray-400 text-xs ml-1">workers</span>
                  </td>
                  <td className="py-3 font-semibold text-red-600">
                    ₹{d.totalLoss?.toLocaleString('en-IN') || 0}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
