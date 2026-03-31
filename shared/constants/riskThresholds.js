const RISK_THRESHOLDS = {
  RAIN_THRESHOLD: 50,        // mm/hr
  AQI_THRESHOLD: 300,        // AQI index
  HEAT_THRESHOLD: 42,        // °C
  TRAFFIC_RATIO_THRESHOLD: 0.4, // currentSpeed / freeFlowSpeed
};

const DISRUPTION_TYPES = {
  HEAVY_RAIN: 'heavy_rain',
  EXTREME_HEAT: 'extreme_heat',
  AQI_HAZARD: 'aqi_hazard',
  TRAFFIC_JAM: 'traffic_jam',
};

const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

module.exports = { RISK_THRESHOLDS, DISRUPTION_TYPES, SEVERITY_LEVELS };
