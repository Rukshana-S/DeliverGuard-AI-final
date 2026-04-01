const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const InsurancePayment = require('../models/InsurancePayment');
const { checkFraud } = require('../services/fraudService');
const { calculateClaim } = require('../utils/helpers');

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
    const coverageActive = latestPayment && now <= latestPayment.graceDeadline;
    if (!coverageActive)
      return res.status(403).json({
        message: 'Your insurance coverage is inactive. Please pay the weekly premium to continue protection.',
        code: 'COVERAGE_INACTIVE',
      });

    const weeklyIncome = Number(latestPayment.weeklyIncome) || Number(req.user.avgDailyIncome) * 7 || 0;
    if (!weeklyIncome || weeklyIncome <= 0)
      return res.status(400).json({ message: 'Invalid weekly income. Please upload salary proof first.' });

    const { hourlyIncome, claimAmount } = calculateClaim(weeklyIncome);
    const incomeLoss = claimAmount;

    console.log(`[CLAIM] weeklyIncome=${weeklyIncome} hourly=${hourlyIncome} claimAmount=${claimAmount}`);

    const claim = await Claim.create({
      userId: req.user._id,
      policyId: policy._id,
      disruptionType,
      location,
      incomeLoss,
      claimAmount,
      status: 'pending',
    });

    const { isSuspicious } = await checkFraud(req.user._id, claim);
    claim.status = isSuspicious ? 'investigating' : 'approved';
    await claim.save();

    res.status(201).json({ ...claim.toObject(), hourlyIncome: Math.round(hourlyIncome) });
  } catch (err) { next(err); }
};

module.exports = { getClaims, getClaimById, createClaim };
