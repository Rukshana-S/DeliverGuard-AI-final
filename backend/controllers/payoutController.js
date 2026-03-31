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
    if (claim.status !== 'approved') return res.status(400).json({ message: 'Claim is not approved for payout' });

    // Prevent duplicate payout
    const existing = await Payout.findOne({ claimId });
    if (existing && existing.paymentStatus === 'success') {
      return res.status(400).json({ message: 'Payout already processed for this claim' });
    }

    const bank = req.user.bankAccount;
    if (!bank?.accountNumber) return res.status(400).json({ message: 'Bank account not configured' });

    // Create pending payout record
    const payout = await Payout.create({
      userId: req.user._id,
      claimId,
      amount: claim.claimAmount,
      paymentStatus: 'processing',
      bankSnapshot: bank,
    });

    // Simulate transfer
    const transfer = await simulateTransfer(claim.claimAmount, bank);

    payout.paymentStatus = 'success';
    payout.razorpayId = transfer.id;
    await payout.save();

    // Mark claim as paid
    claim.status = 'paid';
    await claim.save();

    logger.info(`Payout success: ${transfer.id} — ₹${claim.claimAmount} to ${bank.accountNumber}`);
    res.json(payout);
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
