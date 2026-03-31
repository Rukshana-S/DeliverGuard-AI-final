const { RISK_THRESHOLDS, DISRUPTION_TYPES, SEVERITY_LEVELS } = require('../../shared/constants/riskThresholds');

const analyzeRisk = (weather, aqi, traffic) => {
  const disruptions = [];

  if (weather?.rain != null && weather.rain > RISK_THRESHOLDS.RAIN_THRESHOLD) {
    disruptions.push({
      type: DISRUPTION_TYPES.HEAVY_RAIN,
      value: weather.rain,
      severity: weather.rain > 100 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH,
    });
  }
  if (weather?.temp != null && weather.temp > RISK_THRESHOLDS.HEAT_THRESHOLD) {
    disruptions.push({
      type: DISRUPTION_TYPES.EXTREME_HEAT,
      value: weather.temp,
      severity: weather.temp > 48 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH,
    });
  }
  if (aqi?.aqi != null && aqi.aqi > RISK_THRESHOLDS.AQI_THRESHOLD) {
    disruptions.push({
      type: DISRUPTION_TYPES.AQI_HAZARD,
      value: aqi.aqi,
      severity: aqi.aqi > 400 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH,
    });
  }
  if (traffic?.trafficRatio != null && traffic.trafficRatio < RISK_THRESHOLDS.TRAFFIC_RATIO_THRESHOLD) {
    disruptions.push({
      type: DISRUPTION_TYPES.TRAFFIC_JAM,
      value: traffic.trafficRatio,
      severity: traffic.trafficRatio < 0.2 ? SEVERITY_LEVELS.CRITICAL : SEVERITY_LEVELS.HIGH,
    });
  }

  return disruptions;
};

module.exports = { analyzeRisk };
