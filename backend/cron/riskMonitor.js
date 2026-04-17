const cron = require('node-cron');
const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const InsurancePayment = require('../models/InsurancePayment');
const RiskEvent = require('../models/RiskEvent');
const { getWeather } = require('../services/weatherService');
const { getAQI } = require('../services/aqiService');
const { getTraffic } = require('../services/trafficService');
const { analyzeRisk, getRiskScore } = require('../services/riskEngine');
const { checkFraud } = require('../services/fraudService');
const { calcIncomeLoss, getSeverityFactor } = require('../utils/helpers');
const logger = require('../utils/logger');

// City coordinates for monitoring
const MONITORED_ZONES = [
  { city: 'Mumbai', lat: 19.076, lon: 72.877 },
  { city: 'Delhi', lat: 28.613, lon: 77.209 },
  { city: 'Bangalore', lat: 12.971, lon: 77.594 },
  { city: 'Chennai', lat: 13.083, lon: 80.27 },
];

const processZone = async (zone) => {
  try {
    const [weather, aqi, traffic] = await Promise.all([
      getWeather(zone.lat, zone.lon),
      getAQI(zone.lat, zone.lon),
      getTraffic(zone.lat, zone.lon),
    ]);

    const disruptions = analyzeRisk(weather, aqi, traffic);
    if (!disruptions.length) return;

    for (const disruption of disruptions) {
      const riskEvent = await RiskEvent.create({
        eventType: disruption.type,
        location: { lat: zone.lat, lon: zone.lon, city: zone.city },
        severity: disruption.severity,
        apiSource: ['heavy_rain', 'extreme_heat'].includes(disruption.type) ? 'openweather'
          : disruption.type === 'aqi_hazard' ? 'waqi' : 'tomtom',
        rawData: { weather, aqi, traffic },
      });

      // Find workers in this city with active policies
      const workers = await User.find({ city: zone.city, role: 'worker' });
      for (const worker of workers) {
        const policy = await Policy.findOne({ userId: worker._id, status: 'active' });
        if (!policy) continue;

        // Only auto-claim if worker has active/grace coverage
        const now = new Date();
        const latestPayment = await InsurancePayment.findOne({ userId: worker._id, paymentStatus: 'success' })
          .sort({ coverageStart: -1 });
        if (!latestPayment || now > latestPayment.graceDeadline) continue;

        const severityFactor = getSeverityFactor(disruption.type, disruption.value);
        const incomeLoss = calcIncomeLoss(worker.avgDailyIncome, worker.workingHours, severityFactor);
        const claimAmount = Math.min(incomeLoss, policy.coverageAmount);

        // ML risk score for this worker
        const policyTypeMap = { basic: 0, standard: 1, premium: 2 };
        const userAgeDays = Math.floor((Date.now() - worker.createdAt) / (1000 * 60 * 60 * 24));
        const historicalClaims = await Claim.countDocuments({ userId: worker._id });
        const mlRisk = await getRiskScore(weather, aqi, traffic, {
          historicalClaims,
          avgDailyIncome: worker.avgDailyIncome || 500,
          policyType: policyTypeMap[policy.planType] ?? 0,
          userAgeDays,
        });

        logger.info(`[RISK ML] ${worker.name} score=${mlRisk.riskScore} severity=${mlRisk.severity} claimProb=${mlRisk.claimProbability}`);

        const claim = await Claim.create({
          userId: worker._id,
          policyId: policy._id,
          disruptionType: disruption.type,
          location: { lat: zone.lat, lon: zone.lon, city: zone.city },
          incomeLoss,
          claimAmount,
          status: 'pending',
        });

        const { isSuspicious } = await checkFraud(worker._id, claim);
        if (isSuspicious) {
          await Claim.findByIdAndUpdate(claim._id, { status: 'investigating' });
        } else {
          await Claim.findByIdAndUpdate(claim._id, { status: 'approved' });
        }

        logger.info(`Auto-claim created for ${worker.name} — ${disruption.type} in ${zone.city}`);
      }
    }
  } catch (err) {
    logger.error(`Risk monitor error for ${zone.city}: ${err.message}`);
  }
};

const startRiskMonitor = () => {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Risk monitor running...');
    await Promise.all(MONITORED_ZONES.map(processZone));
  });
  logger.info('Risk monitor scheduled every 5 minutes');
};

module.exports = { startRiskMonitor };
