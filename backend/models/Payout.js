const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true, unique: true },
  amount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending',
  },
  razorpayId: { type: String },
  bankSnapshot: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    holderName: String,
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
