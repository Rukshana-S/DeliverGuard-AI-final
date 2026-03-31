const Policy = require('../models/Policy');

const PLANS = {
  basic:    { premiumPct: 5,  hourThreshold: 8, maxWeeklyPayout: 2000 },
  standard: { premiumPct: 8,  hourThreshold: 6, maxWeeklyPayout: 4000 },
  premium:  { premiumPct: 10, hourThreshold: 4, maxWeeklyPayout: 8000 },
};

const getPlans = (req, res) => {
  try {
    res.json(PLANS);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

const selectPlan = async (req, res, next) => {
  try {
    const { planType } = req.body;
    if (!PLANS[planType]) return res.status(400).json({ message: 'Invalid plan' });
    console.log(`[Policy] Selecting plan: ${planType} for user: ${req.user._id}`);
    await Policy.updateMany({ userId: req.user._id, status: 'active' }, { status: 'cancelled' });
    const plan = PLANS[planType];
    const policy = await Policy.create({
      userId: req.user._id,
      planType,
      weeklyPremium: plan.premiumPct,
      coverageAmount: plan.maxWeeklyPayout,
      premiumPct: plan.premiumPct,
      hourThreshold: plan.hourThreshold,
      maxWeeklyPayout: plan.maxWeeklyPayout,
    });
    res.status(201).json(policy);
  } catch (err) { next(err); }
};

const getActivePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' });
    res.json(policy);
  } catch (err) { next(err); }
};

const cancelPolicy = async (req, res, next) => {
  try {
    await Policy.findOneAndUpdate({ userId: req.user._id, status: 'active' }, { status: 'cancelled' });
    res.json({ message: 'Policy cancelled' });
  } catch (err) { next(err); }
};

module.exports = { getPlans, selectPlan, getActivePolicy, cancelPolicy };
