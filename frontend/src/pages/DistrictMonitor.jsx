import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

export default function DistrictMonitor() {
  const [view, setView] = useState('summary'); // summary | all | alerts | state
  const [summary, setSummary] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/districts/summary');
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllDistricts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/districts/all');
      setDistricts(data.districts);
      setView('all');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/districts/alerts/active');
      setAlerts(data.alerts);
      setView('alerts');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadByState = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/districts/grouped/state');
      setGrouped(data);
      setView('state');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (disruptions) => {
    if (!disruptions || disruptions.length === 0) return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    const hasCritical = disruptions.some(d => d.severity === 'critical');
    if (hasCritical) return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">District Rain Monitoring</h1>
        <p className="text-gray-500 mt-2">Real-time weather monitoring across {summary?.total || 60}+ Indian districts</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Districts', value: summary.total, icon: '🗺️', color: 'blue' },
            { label: 'Active Alerts', value: summary.withAlerts, icon: '🚨', color: 'red' },
            { label: 'Heavy Rain', value: summary.withRain, icon: '🌧️', color: 'indigo' },
            { label: 'High AQI', value: summary.withHighAQI, icon: '😷', color: 'purple' },
            { label: 'Traffic Jam', value: summary.withTraffic, icon: '🚗', color: 'yellow' },
            { label: 'Alert Rate', value: `${summary.alertPercentage}%`, icon: '📊', color: 'green' },
          ].map(({ label, value, icon, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.02 }}
              className={`card bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-800`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'summary', label: 'Summary', icon: '📊', action: () => setView('summary') },
          { key: 'all', label: 'All Districts', icon: '🗺️', action: loadAllDistricts },
          { key: 'alerts', label: 'Active Alerts', icon: '🚨', action: loadAlerts },
          { key: 'state', label: 'By State', icon: '📍', action: loadByState },
        ].map(({ key, label, icon, action }) => (
          <button
            key={key}
            onClick={action}
            disabled={loading}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              view === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            } disabled:opacity-50`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 mt-4">Loading district data...</p>
        </div>
      )}

      {/* All Districts View */}
      {view === 'all' && !loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {districts.map((d) => (
            <div key={d.name} className={`card ${getSeverityColor(d.disruptions)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{d.name}</h3>
                  <p className="text-xs opacity-75">{d.state}</p>
                </div>
                {d.hasAlert && <span className="text-xl">🚨</span>}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Rain:</span>
                  <span className="font-mono">{d.weather?.rain || 0} mm/hr</span>
                </div>
                <div className="flex justify-between">
                  <span>AQI:</span>
                  <span className="font-mono">{d.aqi?.aqi || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temp:</span>
                  <span className="font-mono">{d.weather?.temp || 0}°C</span>
                </div>
                {d.disruptions.length > 0 && (
                  <div className="pt-2 border-t border-current/20">
                    <p className="font-semibold text-xs">Alerts:</p>
                    {d.disruptions.map((dis, i) => (
                      <p key={i} className="text-xs">• {dis.type.replace('_', ' ')}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alerts Only View */}
      {view === 'alerts' && !loading && (
        <div>
          {alerts.length === 0 ? (
            <div className="card text-center py-12">
              <span className="text-6xl">✅</span>
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4">No Active Alerts</p>
              <p className="text-gray-500 mt-2">All districts are operating normally</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((d) => (
                <div key={d.name} className="card bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-red-800 dark:text-red-400">{d.name}</h3>
                      <p className="text-xs text-red-600 dark:text-red-500">{d.state}</p>
                    </div>
                    <span className="text-2xl">🚨</span>
                  </div>
                  <div className="space-y-2">
                    {d.disruptions.map((dis, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-2">
                        <p className="font-semibold text-sm text-red-700 dark:text-red-400">{dis.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Value: {dis.value} | Severity: {dis.severity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* By State View */}
      {view === 'state' && !loading && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([state, districts]) => (
            <div key={state} className="card">
              <button
                onClick={() => setSelectedState(selectedState === state ? null : state)}
                className="w-full flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <div className="text-left">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{state}</h3>
                    <p className="text-sm text-gray-500">{districts.length} districts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {districts.filter(d => d.hasAlert).length > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded-full text-xs font-bold">
                      {districts.filter(d => d.hasAlert).length} alerts
                    </span>
                  )}
                  <span className="text-gray-400">{selectedState === state ? '▼' : '▶'}</span>
                </div>
              </button>
              {selectedState === state && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-4 grid md:grid-cols-2 gap-3"
                >
                  {districts.map((d) => (
                    <div key={d.name} className={`p-3 rounded-lg ${getSeverityColor(d.disruptions)}`}>
                      <div className="flex justify-between items-start">
                        <p className="font-semibold">{d.name}</p>
                        {d.hasAlert && <span>🚨</span>}
                      </div>
                      <div className="text-xs mt-1 space-y-0.5">
                        <p>Rain: {d.weather?.rain || 0} mm/hr</p>
                        <p>AQI: {d.aqi?.aqi || 0}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
