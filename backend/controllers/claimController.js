const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const InsurancePayment = require('../models/InsurancePayment');
const { checkFraud } = require('../services/fraudService');
const { calculateClaim } = require('../utils/helpers');
const logger = require('../utils/logger');

const getClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) { next(err); }
};

const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findOne({ _id: req.params.id, userId: req.user._id });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json(claim);
  } catch (err) { next(err); }
};

const createClaim = async (req, res, next) => {
  try {
    const { disruptionType, location, disruptionValue } = req.body;
    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' });
    if (!policy) return res.status(400).json({ message: 'No active policy' });

    // Coverage validation — must have paid weekly premium
    const now = new Date();
    const latestPayment = await InsurancePayment.findOne({ userId: req.user._id, paymentStatus: 'success' })
      .sort({ coverageStart: -1 });
    const coverageActive = latestPayment && latestPayment.graceDeadline && now <= new Date(latestPayment.graceDeadline);
    if (!coverageActive)
      return res.status(403).json({
        message: 'Your insurance coverage is inactive. Please pay the weekly premium to continue protection.',
        code: 'COVERAGE_INACTIVE',
      });

    // Use user's actual daily income and working hours
    const avgDailyIncome    = Number(req.user.avgDailyIncome) || 0;
    const workingHoursPerDay = Number(req.user.workingHours)  || 7;

    if (!avgDailyIncome || avgDailyIncome <= 0)
      return res.status(400).json({ message: 'Invalid daily income. Please update your profile first.' });

    const { hourlyIncome, claimAmount } = calculateClaim(avgDailyIncome, workingHoursPerDay, policy.maxWeeklyPayout);
    const incomeLoss = claimAmount;

    logger.info(`[CLAIM] income=${avgDailyIncome} hours=${workingHoursPerDay} hourly=${hourlyIncome} claim=${claimAmount}`);

    const claim = await Claim.create({
      userId: req.user._id,
      policyId: policy._id,
      disruptionType,
      location,
      incomeLoss,
      claimAmount,
      status: 'pending',
    });

    const { isSuspicious, mlScore } = await checkFraud(req.user._id, claim);
    claim.status  = isSuspicious ? 'investigating' : 'approved';
    claim.mlScore = mlScore ?? 0;
    await claim.save();

    res.status(201).json({ ...claim.toObject(), hourlyIncome: Math.round(hourlyIncome) });
  } catch (err) { next(err); }
};

module.exports = { getClaims, getClaimById, createClaim };
