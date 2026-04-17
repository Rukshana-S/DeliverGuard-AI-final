const axios = require('axios');
const { getWeather } = require('../services/weatherService');
const { getAQI }     = require('../services/aqiService');
const { getTraffic } = require('../services/trafficService');
const { analyzeRisk, getRiskScore } = require('../services/riskEngine');

const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5002';

const getLiveData = async (req, res) => {
  const lat = parseFloat(req.query.lat) || 19.076;
  const lon = parseFloat(req.query.lon) || 72.877;

  try {
    const [weather, aqi, traffic] = await Promise.all([
      getWeather(lat, lon),
      getAQI(lat, lon),
      getTraffic(lat, lon),
    ]);
    const disruptions = analyzeRisk(weather, aqi, traffic);
    res.json({ weather, aqi, traffic, disruptions });
  } catch (err) {
    res.status(500).json({ message: 'Monitoring service temporarily unavailable', weather: null, aqi: null, traffic: null, disruptions: [] });
  }
};

const testFraud = async (req, res) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE}/predict`, req.body, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    res.status(503).json({ message: 'ML service unavailable. Make sure python ml_app.py is running on port 5002.' });
  }
};

const testRisk = async (req, res) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE}/predict-risk`, req.body, { timeout: 5000 });
    res.json(data);
  } catch (err) {
    res.status(503).json({ message: 'ML service unavailable. Make sure python ml_app.py is running on port 5002.' });
  }
};

module.exports = { getLiveData, testFraud, testRisk };
