const mongoose = require('mongoose');

const fraudLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimId: { type: mongoose.Schema.Types.ObjectId, ref: 'Claim', required: true },
  fraudType: {
    type: String,
    enum: ['gps_spoof', 'duplicate_claim', 'api_mismatch', 'abnormal_frequency', 'ml_fraud_detected', 'ml_risk'],
    required: true,
  },
  riskScore: { type: Number, required: true, min: 0, max: 100 },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('FraudLog', fraudLogSchema);
