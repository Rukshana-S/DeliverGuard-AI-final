const mongoose = require('mongoose');

const insurancePaymentSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planName:          { type: String, required: true },
  weeklyIncome:      { type: Number, required: true },
  premiumPercentage: { type: Number, required: true },
  premiumAmount:     { type: Number, required: true },
  paymentDate:       { type: Date, default: Date.now },
  coverageStart:     { type: Date, required: true },
  coverageEnd:       { type: Date, required: true },
  graceDeadline:     { type: Date, required: true },
  paymentStatus:     { type: String, enum: ['success', 'pending', 'failed'], default: 'success' },
  transactionId:     { type: String },
  ocrImageUrl:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('InsurancePayment', insurancePaymentSchema);
