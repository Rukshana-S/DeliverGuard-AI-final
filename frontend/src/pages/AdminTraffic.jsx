import { useEffect, useState } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ChartCard from '../components/ChartCard';

const LEVEL_BADGE = {
  Low:      'bg-green-100 text-green-700',
  Moderate: 'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Severe:   'bg-red-100 text-red-700',
};

const LEVEL_COLOR = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', Severe: '#ef4444' };

export default function AdminTraffic() {
  const [roads, setRoads]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity]     = useState('all');

  useEffect(() => {
    api.get('/admin/traffic')
      .then((r) => setRoads(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cities   = ['all', ...new Set(roads.map((r) => r.city))];
  const filtered = city === 'all' ? roads : roads.filter((r) => r.city === city);

  const avgByCongestion = cities.filter((c) => c !== 'all').map((c) => ({
    city: c,
    avg: Math.round(roads.filter((r) => r.city === c).reduce((s, r) => s + r.congestion, 0) /
         (roads.filter((r) => r.city === c).length || 1)),
  }));

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Roads',    value: roads.length,                                          color: 'text-blue-600' },
          { label: 'Severe Traffic', value: roads.filter((r) => r.level === 'Severe').length,      color: 'text-red-600' },
          { label: 'High Traffic',   value: roads.filter((r) => r.level === 'High').length,        color: 'text-orange-600' },
          { label: 'Avg Speed',      value: `${Math.round(roads.reduce((s,r)=>s+r.speed,0)/(roads.length||1))} km/h`, color: 'text-green-600' },
        ].map((c) => (
          <div key={c.label} className="card text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* City congestion chart */}
      <ChartCard title="Average Congestion Index by City">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={avgByCongestion}>
            <XAxis dataKey="city" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="avg" radius={[4,4,0,0]} name="Congestion %">
              {avgByCongestion.map((d, i) => (
                <Cell key={i} fill={d.avg > 70 ? '#ef4444' : d.avg > 50 ? '#f97316' : d.avg > 35 ? '#f59e0b' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Filter + Table */}
      <div className="card overflow-x-auto">
        <div className="flex items-center gap-3 mb-4">
          {cities.map((c) => (
            <button key={c} onClick={() => setCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                city === c ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
              {c === 'all' ? 'All Cities' : c}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                <th className="pb-3 pr-4">City</th>
                <th className="pb-3 pr-4">Road Name</th>
                <th className="pb-3 pr-4">Congestion</th>
                <th className="pb-3 pr-4">Vehicle Density</th>
                <th className="pb-3 pr-4">Avg Speed</th>
                <th className="pb-3">Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <td className="py-3 pr-4 font-medium">{r.city}</td>
                  <td className="py-3 pr-4">{r.road}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${r.congestion}%`, backgroundColor: LEVEL_COLOR[r.level] }} />
                      </div>
                      <span className="font-semibold text-xs">{r.congestion}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">{r.density} veh/hr</td>
                  <td className="py-3 pr-4">{r.speed} km/h</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${LEVEL_BADGE[r.level] || 'bg-gray-100 text-gray-700'}`}>
                      {r.level}
                    </span>
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
