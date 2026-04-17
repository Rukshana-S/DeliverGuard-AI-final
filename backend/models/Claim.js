const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  disruptionType: {
    type: String,
    enum: ['heavy_rain', 'extreme_heat', 'aqi_hazard', 'traffic_jam'],
    required: true,
  },
  location: {
    lat: Number,
    lon: Number,
    city: String,
  },
  incomeLoss: { type: Number, required: true },
  claimAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'investigating'],
    default: 'pending',
  },
  fraudScore: { type: Number, default: 0 },
  mlScore:    { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
