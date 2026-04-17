const axios  = require('axios');
const Claim    = require('../models/Claim');
const FraudLog = require('../models/FraudLog');
const User     = require('../models/User');
const logger   = require('../utils/logger');

const ML_SERVICE = process.env.ML_SERVICE_URL || 'http://localhost:5002';

const checkFraud = async (userId, claimData) => {
  let riskScore = 0;
  const flags   = [];

  // ── Rule-based checks ──────────────────────────────────────────
  const recentClaims = await Claim.countDocuments({
    userId,
    disruptionType: claimData.disruptionType,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentClaims > 2) { riskScore += 40; flags.push('duplicate_claim'); }

  const weekClaims = await Claim.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  if (weekClaims > 5) { riskScore += 30; flags.push('abnormal_frequency'); }

  // ── ML prediction ──────────────────────────────────────────────
  let mlScore = 0;
  let mlLabel = 'low';
  try {
    const user = await User.findById(userId).select('avgDailyIncome createdAt');
    const userAgeDays = user?.createdAt ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) : 90;

    const { data } = await axios.post(`${ML_SERVICE}/predict`, {
      disruption_value:    claimData.disruptionValue  ?? 0,
      claims_last_24h:     recentClaims,
      claims_last_7d:      weekClaims,
      claim_amount:        claimData.claimAmount       || 0,
      avg_daily_income:    user?.avgDailyIncome        || 500,
      disruption_type:     claimData.disruptionType    || 'heavy_rain',
      user_age_days:       userAgeDays,
    }, { timeout: 5000 });

    mlScore = data.riskScore || 0;
    mlLabel = data.label     || 'low';
    if (data.isSuspicious) flags.push('ml_fraud_detected');
    logger.info(`[ML] userId=${userId} mlScore=${mlScore} label=${mlLabel} details=${JSON.stringify(data.details)}`);
  } catch (err) {
    logger.warn(`[ML] Service unavailable — using rule-based only: ${err.message}`);
  }

  // ── Merge: 60% rule-based + 40% ML ────────────────────────────
  const finalScore = Math.round(riskScore * 0.6 + mlScore * 0.4);

  if (finalScore > 50) {
    await FraudLog.create({
      userId,
      claimId:   claimData._id,
      fraudType: flags[0] || 'ml_risk',
      riskScore: finalScore,
    });
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: -100, fraudEvents: 1, riskScore: finalScore },
    });
    logger.warn(`[FRAUD] userId=${userId} finalScore=${finalScore} flags=${flags.join(',')}`);
  }

  return { riskScore: finalScore, mlScore, mlLabel, isSuspicious: finalScore > 50 };
};

module.exports = { checkFraud };
