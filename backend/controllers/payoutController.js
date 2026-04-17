const Claim = require('../models/Claim');
const Payout = require('../models/Payout');
const logger = require('../utils/logger');

// Simulate IMPS transfer (Razorpay test mode)
const simulateTransfer = (amount, bank) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        status: 'success',
      });
    }, 1200); // simulate network delay
  });
};

const initiatePayout = async (req, res, next) => {
  try {
    const { claimId } = req.body;

    const claim = await Claim.findOne({ _id: claimId, userId: req.user._id });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    // Only allow payout for approved claims — do NOT auto-approve investigating/pending
    if (!['approved', 'paid'].includes(claim.status))
      return res.status(403).json({ message: claim.status === 'investigating' ? 'Claim is under fraud review. Please wait for admin approval.' : 'Claim is not yet approved for payout.' });

    // Prevent duplicate payout — but return existing payout data so frontend can use it
    const existing = await Payout.findOne({ claimId });
    if (existing && existing.paymentStatus === 'success') {
      return res.json({
        _id:           existing._id,
        amount:        existing.amount,
        razorpayId:    existing.razorpayId,
        paymentStatus: existing.paymentStatus,
        createdAt:     existing.createdAt,
        bankSnapshot:  existing.bankSnapshot,
      });
    }

    const bank = req.user.bankAccount;

    logger.info(`[PAYOUT] claimId=${claimId} claimAmount=${claim.claimAmount}`);
    const payout = await Payout.create({
      userId: req.user._id,
      claimId,
      amount: claim.claimAmount,
      paymentStatus: 'processing',
      bankSnapshot: bank || {},
    });

    // Simulate IMPS transfer
    const transfer = await simulateTransfer(claim.claimAmount, bank);

    payout.paymentStatus = 'success';
    payout.razorpayId = transfer.id;
    await payout.save();

    // Mark claim as paid
    claim.status = 'paid';
    await claim.save();

    logger.info(`Payout success: ${transfer.id} — ₹${claim.claimAmount}`);
    res.json({
      _id:           payout._id,
      amount:        payout.amount,
      razorpayId:    payout.razorpayId,
      paymentStatus: payout.paymentStatus,
      createdAt:     payout.createdAt,
      bankSnapshot:  payout.bankSnapshot,
    });
  } catch (err) { next(err); }
};

const getPayoutStatus = async (req, res, next) => {
  try {
    const payout = await Payout.findOne({ claimId: req.params.claimId, userId: req.user._id });
    if (!payout) return res.status(404).json({ message: 'No payout found for this claim' });
    res.json(payout);
  } catch (err) { next(err); }
};

const getPayoutHistory = async (req, res, next) => {
  try {
    const payouts = await Payout.find({ userId: req.user._id })
      .populate('claimId', 'disruptionType location claimAmount')
      .sort({ createdAt: -1 });
    res.json(payouts);
  } catch (err) { next(err); }
};

module.exports = { initiatePayout, getPayoutStatus, getPayoutHistory };
