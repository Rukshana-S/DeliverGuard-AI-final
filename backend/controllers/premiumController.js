const InsurancePayment = require('../models/InsurancePayment');
const Policy = require('../models/Policy');
const User = require('../models/User');

const PLAN_RATES = { basic: 5, standard: 8, premium: 10 };

// POST /api/payments/weekly-premium
const payWeeklyPremium = async (req, res, next) => {
  try {
    const { weeklyIncome, transactionId, ocrImageUrl } = req.body;

    if (!weeklyIncome || weeklyIncome <= 0)
      return res.status(400).json({ message: 'Invalid weekly income' });

    const policy = await Policy.findOne({ userId: req.user._id, status: 'active' });
    if (!policy)
      return res.status(400).json({ message: 'No active policy found. Please select a plan first.' });

    const premiumPercentage = PLAN_RATES[policy.planType] ?? policy.premiumPct;
    const premiumAmount = Math.round((weeklyIncome * premiumPercentage) / 100);

    const coverageStart = new Date();
    const coverageEnd = new Date(coverageStart);
    coverageEnd.setDate(coverageEnd.getDate() + 7);
    const graceDeadline = new Date(coverageEnd);
    graceDeadline.setDate(graceDeadline.getDate() + 1);

    const txnId = transactionId || `TXN-${Date.now()}`;

    const payment = await InsurancePayment.create({
      userId: req.user._id,
      planName: policy.planType,
      weeklyIncome,
      premiumPercentage,
      premiumAmount,
      paymentDate: coverageStart,
      coverageStart,
      coverageEnd,
      graceDeadline,
      paymentStatus: 'success',
      transactionId: txnId,
      ocrImageUrl: ocrImageUrl || '',
    });

    // +50 loyalty points for every premium payment
    await User.findByIdAndUpdate(req.user._id, { $inc: { loyaltyPoints: 50 } });

    res.status(201).json(payment);
  } catch (err) { next(err); }
};

// GET /api/payments/history
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await InsurancePayment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { next(err); }
};

// GET /api/payments/status
const getCoverageStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const latest = await InsurancePayment.findOne({ userId: req.user._id, paymentStatus: 'success' })
      .sort({ coverageStart: -1 });

    if (!latest) return res.json({ active: false, reason: 'no_payment' });

    if (now <= latest.coverageEnd) return res.json({ active: true, payment: latest });

    if (now <= latest.graceDeadline)
      return res.json({ active: true, inGrace: true, payment: latest });

    return res.json({ active: false, reason: 'expired', payment: latest });
  } catch (err) { next(err); }
};

// POST /api/payments/verify-password
const verifyPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Incorrect password' });
    res.json({ success: true });
  } catch (err) { next(err); }
};

module.exports = { payWeeklyPremium, getPaymentHistory, getCoverageStatus, verifyPassword };
