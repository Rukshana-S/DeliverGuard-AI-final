const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  amount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'success', 'failed'],
    default: 'pending',
  },
  razorpayId: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
