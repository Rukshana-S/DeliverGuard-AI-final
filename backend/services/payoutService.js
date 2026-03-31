const Razorpay = require('razorpay');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const initiatePayout = async (userId, claimId, amount, bankAccount) => {
  try {
    // Razorpay payout simulation (test mode)
    const payout = await razorpay.payouts.create({
      account_number: process.env.RAZORPAY_KEY_ID,
      fund_account: {
        account_type: 'bank_account',
        bank_account: {
          name: bankAccount.name,
          ifsc: bankAccount.ifscCode,
          account_number: bankAccount.accountNumber,
        },
      },
      amount: amount * 100, // paise
      currency: 'INR',
      mode: 'IMPS',
      purpose: 'payout',
    });

    const tx = await Transaction.create({
      userId,
      claimId,
      amount,
      paymentStatus: 'success',
      razorpayId: payout.id,
    });

    logger.info(`Payout initiated: ${payout.id} for claim ${claimId}`);
    return tx;
  } catch (err) {
    logger.error(`Payout failed: ${err.message}`);
    await Transaction.create({ userId, claimId, amount, paymentStatus: 'failed' });
    throw err;
  }
};

module.exports = { initiatePayout };
