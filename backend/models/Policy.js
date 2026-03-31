const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  planType:       { type: String, enum: ['basic', 'standard', 'premium'], required: true },
  weeklyPremium:  { type: Number },   // kept for legacy reads
  coverageAmount: { type: Number },   // kept for legacy reads
  premiumPct:     { type: Number },   // % of weekly income
  hourThreshold:  { type: Number },
  maxWeeklyPayout:{ type: Number },
  startDate:      { type: Date, default: Date.now },
  status:         { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Policy', policySchema);
