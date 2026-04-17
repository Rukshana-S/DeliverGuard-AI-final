const axios = require('axios');
const { INDIAN_DISTRICTS } = require('../../shared/constants/districts');
const { getWeather } = require('./weatherService');
const { getAQI } = require('./aqiService');
const { getTraffic } = require('./trafficService');
const { analyzeRisk } = require('./riskEngine');
const logger = require('../utils/logger');

// Cache to avoid hitting API limits
const districtCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get weather data for all districts (batched with delay to avoid rate limits)
 */
const getAllDistrictsData = async () => {
  const now = Date.now();
  const cached = districtCache.get('all');
  
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  const results = [];
  
  // Process in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < INDIAN_DISTRICTS.length; i += batchSize) {
    const batch = INDIAN_DISTRICTS.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (district) => {
      try {
        const [weather, aqi, traffic] = await Promise.all([
          getWeather(district.lat, district.lon),
          getAQI(district.lat, district.lon),
          getTraffic(district.lat, district.lon),
        ]);

        const disruptions = analyzeRisk(weather, aqi, traffic);
        
        return {
          name: district.name,
          state: district.state,
          lat: district.lat,
          lon: district.lon,
          weather,
          aqi,
          traffic,
          disruptions,
          hasAlert: disruptions.length > 0,
          timestamp: now,
        };
      } catch (err) {
        logger.warn(`Failed to fetch data for ${district.name}: ${err.message}`);
        return {
          name: district.name,
          state: district.state,
          lat: district.lat,
          lon: district.lon,
          weather: null,
          aqi: null,
          traffic: null,
          disruptions: [],
          hasAlert: false,
          error: err.message,
          timestamp: now,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Delay between batches to respect rate limits
    if (i + batchSize < INDIAN_DISTRICTS.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  districtCache.set('all', { data: results, timestamp: now });
  return results;
};

/**
 * Get data for a specific district by name
 */
const getDistrictData = async (districtName) => {
  const district = INDIAN_DISTRICTS.find(d => 
    d.name.toLowerCase() === districtName.toLowerCase()
  );

  if (!district) {
    throw new Error(`District ${districtName} not found`);
  }

  const cacheKey = `district_${district.name}`;
  const now = Date.now();
  const cached = districtCache.get(cacheKey);

  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }

  const [weather, aqi, traffic] = await Promise.all([
    getWeather(district.lat, district.lon),
    getAQI(district.lat, district.lon),
    getTraffic(district.lat, district.lon),
  ]);

  const disruptions = analyzeRisk(weather, aqi, traffic);

  const data = {
    name: district.name,
    state: district.state,
    lat: district.lat,
    lon: district.lon,
    weather,
    aqi,
    traffic,
    disruptions,
    hasAlert: disruptions.length > 0,
    timestamp: now,
  };

  districtCache.set(cacheKey, { data, timestamp: now });
  return data;
};

/**
 * Get only districts with active alerts
 */
const getAlertsOnly = async () => {
  const allData = await getAllDistrictsData();
  return allData.filter(d => d.hasAlert);
};

/**
 * Get districts grouped by state
 */
const getDistrictsByState = async () => {
  const allData = await getAllDistrictsData();
  const grouped = {};

  allData.forEach(district => {
    if (!grouped[district.state]) {
      grouped[district.state] = [];
    }
    grouped[district.state].push(district);
  });

  return grouped;
};

/**
 * Get summary statistics
 */
const getDistrictSummary = async () => {
  const allData = await getAllDistrictsData();
  
  const total = allData.length;
  const withAlerts = allData.filter(d => d.hasAlert).length;
  const withRain = allData.filter(d => d.weather?.rain > 50).length;
  const withHighAQI = allData.filter(d => d.aqi?.aqi > 300).length;
  const withTraffic = allData.filter(d => d.traffic?.trafficRatio < 0.4).length;

  return {
    total,
    withAlerts,
    withRain,
    withHighAQI,
    withTraffic,
    alertPercentage: ((withAlerts / total) * 100).toFixed(1),
  };
};

module.exports = {
  getAllDistrictsData,
  getDistrictData,
  getAlertsOnly,
  getDistrictsByState,
  getDistrictSummary,
  INDIAN_DISTRICTS,
};
