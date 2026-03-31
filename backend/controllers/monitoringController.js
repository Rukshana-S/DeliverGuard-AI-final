const { getWeather } = require('../services/weatherService');
const { getAQI }     = require('../services/aqiService');
const { getTraffic } = require('../services/trafficService');
const { analyzeRisk } = require('../services/riskEngine');

const getLiveData = async (req, res) => {
  const lat = parseFloat(req.query.lat) || 19.076;
  const lon = parseFloat(req.query.lon) || 72.877;
  console.log(`[Monitoring] Request — lat: ${lat}, lon: ${lon}`);

  try {
    const [weather, aqi, traffic] = await Promise.all([
      getWeather(lat, lon),
      getAQI(lat, lon),
      getTraffic(lat, lon),
    ]);

    const disruptions = analyzeRisk(weather, aqi, traffic);
    console.log(`[Monitoring] OK — disruptions: ${disruptions.length}`);
    res.json({ weather, aqi, traffic, disruptions });
  } catch (err) {
    console.error('[Monitoring] Unexpected error:', err.message);
    res.status(500).json({
      message: 'Monitoring service temporarily unavailable',
      weather: null, aqi: null, traffic: null, disruptions: [],
    });
  }
};

module.exports = { getLiveData };
