import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLiveData } from '../services/monitoringService';
import MapComponent from '../components/MapComponent';
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

function MetricCard({ title, value, icon: Icon, color, subtitle, alert, alertText }) {
  const colors = {
    blue:   { bg: 'bg-blue-50 dark:bg-blue-900/20',   text: 'text-blue-600',   border: 'border-blue-200' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600', border: 'border-orange-200' },
    green:  { bg: 'bg-green-50 dark:bg-green-900/20',  text: 'text-green-600',  border: 'border-green-200' },
    red:    { bg: 'bg-red-50 dark:bg-red-900/20',      text: 'text-red-600',    border: 'border-red-300' },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card relative flex items-center gap-4 ${alert ? `border-2 ${c.border}` : ''}`}
    >
      {alert && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
      )}
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${alert ? c.text : 'text-gray-800 dark:text-gray-100'}`}>{value}</p>
        {alert && alertText
          ? <p className={`text-xs font-semibold mt-0.5 ${c.text}`}>{alertText}</p>
          : subtitle && <p className="text-xs text-gray-400">{subtitle}</p>
        }
      </div>
    </motion.div>
  );
}

export default function LiveMonitoring() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [logs,        setLogs]        = useState([]);
  const [simulated,   setSimulated]   = useState(false);
  const [coords,      setCoords]      = useState([13.0827, 80.2707]);

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

  const weather  = data?.weather;
  const aqi      = data?.aqi;
  const traffic  = data?.traffic;
  const rainVal  = simulated ? 65 : (weather?.rain ?? 0);
  const rainAlert = simulated || rainVal > 50;

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

      {/* Alert Banner — only when simulated */}
      <AnimatePresence>
        {simulated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 px-4 py-3 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
          >
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                Active Disruption Detected: Heavy Rain
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                You are eligible for compensation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-24 bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rain card — special when simulated */}
          <MetricCard
            title="Rainfall"
            value={`${rainVal} mm`}
            icon={CloudRain}
            color={rainAlert ? 'red' : 'blue'}
            subtitle="Normal"
            alert={rainAlert}
            alertText={rainAlert ? 'Heavy Rain Detected' : null}
          />
          <MetricCard
            title="Temperature"
            value={weather ? `${weather.temp}°C` : 'N/A'}
            icon={Thermometer}
            color={weather?.temp > 42 ? 'red' : 'orange'}
            subtitle={weather?.humidity ? `Humidity: ${weather.humidity}%` : '—'}
          />
          <MetricCard
            title="AQI Level"
            value={aqi ? aqi.aqi : 'N/A'}
            icon={Wind}
            color={aqi?.aqi > 300 ? 'red' : aqi?.aqi > 150 ? 'orange' : 'green'}
            subtitle={aqi?.aqi > 300 ? 'Hazardous' : aqi?.aqi > 150 ? 'Unhealthy' : 'Good'}
          />
          <MetricCard
            title="Traffic Ratio"
            value={traffic ? traffic.trafficRatio?.toFixed(2) : 'N/A'}
            icon={TrafficCone}
            color={traffic?.trafficRatio < 0.4 ? 'red' : traffic?.trafficRatio < 0.6 ? 'orange' : 'green'}
            subtitle={traffic?.trafficRatio < 0.4 ? 'Severe jam' : 'Normal flow'}
          />
        </div>
      )}

      {/* Active Disruption Alerts — only when simulated */}
      <AnimatePresence>
        {simulated && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
              <AlertTriangle size={15} /> Active Disruption Alerts
            </p>
            <div className="card border-l-4 border-red-500 flex items-center justify-between bg-red-50 dark:bg-red-900/10">
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400">Heavy Rain Detected</p>
                <p className="text-sm text-gray-500 mt-0.5">Intensity: 65</p>
              </div>
              <span className="font-bold uppercase text-sm px-3 py-1 rounded-full bg-white dark:bg-gray-900 text-red-500">
                HIGH RISK
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulate Disruption button */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
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
          <MapComponent center={coords} disruptions={[]} />
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
