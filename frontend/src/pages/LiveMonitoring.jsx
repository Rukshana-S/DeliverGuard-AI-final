import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveData } from '../services/monitoringService';
import MapComponent from '../components/MapComponent';
import StatCard from '../components/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  CloudRain, Thermometer, Wind, TrafficCone,
  MapPin, RefreshCw, AlertTriangle, Zap, ScrollText,
  CheckCircle, AlertCircle, Info,
} from 'lucide-react';

const CITY_COORDS = {
  Chennai: [13.0827, 80.2707], Coimbatore: [11.0168, 76.9558], Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047], Salem: [11.6643, 78.1460], Erode: [11.3410, 77.7172],
  Tiruppur: [11.1085, 77.3411], Vellore: [12.9165, 79.1325], Thanjavur: [10.7870, 79.1378],
  Dindigul: [10.3673, 77.9803], Karur: [10.9601, 78.0766], Namakkal: [11.2194, 78.1674],
  Cuddalore: [11.7447, 79.7680], Nagapattinam: [10.7656, 79.8428], Tiruvarur: [10.7749, 79.6350],
  Villupuram: [11.9401, 79.4861], Kanchipuram: [12.8342, 79.7036], Tiruvallur: [13.1440, 79.9080],
  Krishnagiri: [12.5266, 78.2140], Dharmapuri: [12.1211, 78.1582], Perambalur: [11.2342, 78.8836],
  Ariyalur: [11.1398, 79.0756], Pudukkottai: [10.3797, 78.8208], Ramanathapuram: [9.3639, 78.8391],
  Sivaganga: [9.8433, 78.4809], Virudhunagar: [9.5680, 77.9624], Theni: [10.0104, 77.4768],
  Tirunelveli: [8.7139, 77.7567], Thoothukudi: [8.7642, 78.1348], Kanyakumari: [8.0883, 77.5385],
  Mumbai: [19.076, 72.877], Delhi: [28.613, 77.209], Bangalore: [12.971, 77.594],
  Hyderabad: [17.385, 78.486], Pune: [18.520, 73.856],
};

const getCityCoords = (city) => {
  if (!city) return [13.0827, 80.2707];
  const key = Object.keys(CITY_COORDS).find((k) => k.toLowerCase() === city.toLowerCase());
  return key ? CITY_COORDS[key] : [13.0827, 80.2707];
};

const RISK_COLORS = {
  low: 'text-green-500', medium: 'text-yellow-500',
  high: 'text-orange-500', critical: 'text-red-500',
};

const DISRUPTION_LABELS = {
  heavy_rain: 'Heavy Rain Detected', extreme_heat: 'Extreme Heat Detected',
  aqi_hazard: 'AQI Hazard Detected', traffic_jam: 'Traffic Jam Detected',
};

export default function LiveMonitoring() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [logs, setLogs] = useState([]);
  const [simulated, setSimulated] = useState(false);
  const [coords, setCoords] = useState([13.0827, 80.2707]);

  // Set coords from user city
  useEffect(() => {
    if (user?.city) setCoords(getCityCoords(user.city));
  }, [user?.city]);

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setLogs((prev) => [{ time, msg, type }, ...prev].slice(0, 20));
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await getLiveData(coords[0], coords[1]);
      setData(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      const city = user?.city || 'your city';
      addLog(`Live data refreshed for ${city}`, 'success');
      if (res.data?.weather) addLog(`Rain: ${res.data.weather.rain}mm | Temp: ${res.data.weather.temp}°C`, 'info');
      if (res.data?.aqi)     addLog(`AQI: ${res.data.aqi.aqi} — ${city}`, 'info');
      if (res.data?.traffic) addLog(`Traffic ratio: ${res.data.traffic.trafficRatio?.toFixed(2)}`, 'info');
      if (res.data?.disruptions?.length > 0) {
        res.data.disruptions.forEach((d) =>
          addLog(`Alert: ${d.type.replace(/_/g, ' ')} — severity: ${d.severity}`, 'alert')
        );
      }
    } catch {
      addLog('API unavailable — showing cached data', 'warning');
    } finally {
      setLoading(false);
    }
  }, [coords, user?.city]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSimulate = () => {
    setSimulated(true);
    addLog('Disruption simulated: Heavy Rain 65mm — HIGH RISK', 'alert');
    navigate('/claim/detected');
  };

  const weather = data?.weather;
  const aqi = data?.aqi;
  const traffic = data?.traffic;
  const disruptions = data?.disruptions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Live Environmental Monitoring
            {user?.city && <span className="text-blue-500 ml-2 text-base">— {user.city}</span>}
          </h2>
          {lastUpdated && <p className="text-xs text-gray-400 mt-0.5">Last updated: {lastUpdated} · Auto-refreshes every 5 min</p>}
        </div>
        <button onClick={fetchData} className="btn-secondary text-sm flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Rainfall"      value={weather ? `${weather.rain} mm/hr` : 'N/A'} icon={CloudRain}    color={weather?.rain > 50 ? 'red' : 'blue'}   subtitle={weather?.rain > 50 ? 'Above threshold' : 'Normal'} />
          <StatCard title="Temperature"   value={weather ? `${weather.temp}°C` : 'N/A'}    icon={Thermometer}  color={weather?.temp > 42 ? 'red' : 'orange'} subtitle={weather?.humidity ? `Humidity: ${weather.humidity}%` : '—'} />
          <StatCard title="AQI Level"     value={aqi ? aqi.aqi : 'N/A'}                     icon={Wind}         color={aqi?.aqi > 300 ? 'red' : aqi?.aqi > 150 ? 'orange' : 'green'} subtitle={aqi?.aqi > 300 ? 'Hazardous' : aqi?.aqi > 150 ? 'Unhealthy' : 'Good'} />
          <StatCard title="Traffic Ratio" value={traffic ? traffic.trafficRatio?.toFixed(2) : 'N/A'} icon={TrafficCone} color={traffic?.trafficRatio < 0.4 ? 'red' : traffic?.trafficRatio < 0.6 ? 'orange' : 'green'} subtitle={traffic?.trafficRatio < 0.4 ? 'Severe jam' : 'Normal flow'} />
        </div>
      )}

      {/* Disruption alerts */}
      <AnimatePresence>
        {disruptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={15} /> Active Disruption Alerts
            </p>
            {disruptions.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ delay: i * 0.1 }}
                className="card border-l-4 border-red-500 flex items-center justify-between bg-red-50 dark:bg-red-900/10"
              >
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    {DISRUPTION_LABELS[d.type] || d.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">Intensity: {d.value}</p>
                </div>
                <span className={`font-bold uppercase text-sm px-3 py-1 rounded-full bg-white dark:bg-gray-900 ${RISK_COLORS[d.severity]}`}>
                  {d.severity}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Simulate Disruption */}
      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={handleSimulate}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold rounded-2xl px-6 py-4 flex items-center justify-between transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <Zap size={22} />
          <div className="text-left">
            <p className="text-base font-bold">Simulate Disruption — Heavy Rain</p>
            <p className="text-xs text-red-100 mt-0.5">Rain = 65mm · Status = HIGH RISK</p>
          </div>
        </div>
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full shrink-0">Demo Mode</span>
      </motion.button>

      {/* Map + Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4 flex items-center gap-2">
            <MapPin size={14} /> Live Disruption Map — {user?.city || 'Your City'}
          </h3>
          <MapComponent center={coords} disruptions={disruptions} />
        </div>

        <div className="card overflow-hidden flex flex-col">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <ScrollText size={14} /> System Logs
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-72">
            {logs.length === 0 && <p className="text-xs text-gray-400">Loading logs...</p>}
            {logs.map((log, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2 text-xs">
                <span className="text-gray-400 shrink-0 w-16">{log.time}</span>
                <span className={
                  log.type === 'success' ? 'text-green-600' :
                  log.type === 'alert'   ? 'text-red-500 font-medium' :
                  log.type === 'warning' ? 'text-yellow-600' :
                  'text-gray-600 dark:text-gray-400'
                }>
                  {log.type === 'success' ? <CheckCircle size={11} className="inline mr-1" /> :
                   log.type === 'alert'   ? <AlertTriangle size={11} className="inline mr-1" /> :
                   log.type === 'warning' ? <AlertCircle size={11} className="inline mr-1" /> :
                   <Info size={11} className="inline mr-1" />}
                  {log.msg}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
