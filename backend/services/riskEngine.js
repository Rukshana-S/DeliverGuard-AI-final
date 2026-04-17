const axios = require('axios');
const { RISK_THRESHOLDS, DISRUPTION_TYPES, SEVERITY_LEVELS } = require('../../shared/constants/riskThresholds');

const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5002';

// Rule-based disruption detection (unchanged)
const analyzeRisk = (weather, aqi, traffic) => {
  const disruptions = [];

  if (weather?.rain != null && weather.rain > RISK_THRESHOLDS.RAIN_THRESHOLD) {
    disruptions.push({
      type: DISRUPTION_TYPES.HEAVY_RAIN,
      value: weather.rain,
      severity: weather.rain > 100 ? SEVERITY_LEVELS.CRITICAL : weather.rain > 80 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM,
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

// ML-enhanced risk scoring
const getRiskScore = async (weather, aqi, traffic, userContext = {}) => {
  try {
    const { data } = await axios.post(`${ML_SERVICE}/predict-risk`, {
      rain_mm:           weather?.rain        || 0,
      aqi:               aqi?.aqi             || 0,
      temperature:       weather?.temp        || 30,
      traffic_ratio:     traffic?.trafficRatio || 1.0,
      historical_claims: userContext.historicalClaims || 0,
      avg_daily_income:  userContext.avgDailyIncome   || 500,
      policy_type:       userContext.policyType       || 0,
      user_age_days:     userContext.userAgeDays       || 90,
    }, { timeout: 5000 });

    return data;
  } catch {
    // Fallback to rule-based score if ML is unavailable
    const disruptions = analyzeRisk(weather, aqi, traffic);
    const score = disruptions.length * 25;
    return {
      riskScore:          Math.min(score, 100),
      severity:           score >= 75 ? 'critical' : score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low',
      claimProbability:   score / 100,
      expectedPayout:     0,
      shouldTriggerClaim: score >= 50,
    };
  }
};

module.exports = { analyzeRisk, getRiskScore };
