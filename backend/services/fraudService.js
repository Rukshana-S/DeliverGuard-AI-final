const Claim = require('../models/Claim');
const FraudLog = require('../models/FraudLog');
const User = require('../models/User');
const logger = require('../utils/logger');

const checkFraud = async (userId, claimData) => {
  let riskScore = 0;
  const flags = [];

  // Check duplicate claims in last 24h
  const recentClaims = await Claim.countDocuments({
    userId,
    disruptionType: claimData.disruptionType,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  });
  if (recentClaims > 2) {
    riskScore += 40;
    flags.push('duplicate_claim');
  }

  // Check abnormal claim frequency (>5 claims in 7 days)
  const weekClaims = await Claim.countDocuments({
    userId,
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });
  if (weekClaims > 5) {
    riskScore += 30;
    flags.push('abnormal_frequency');
  }

  if (riskScore > 50) {
    await FraudLog.create({
      userId,
      claimId: claimData._id,
      fraudType: flags[0],
      riskScore,
    });
    // -100 loyalty points for fraud/risk detection
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: -100, fraudEvents: 1, riskScore: riskScore },
    });
    logger.warn(`Fraud detected for user ${userId} — score: ${riskScore}, -100 pts`);
  }

  return { riskScore, isSuspicious: riskScore > 50 };
};

module.exports = { checkFraud };
