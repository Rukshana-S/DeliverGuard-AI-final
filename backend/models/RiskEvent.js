const mongoose = require('mongoose');

const riskEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['heavy_rain', 'extreme_heat', 'aqi_hazard', 'traffic_jam'],
    required: true,
  },
  location: {
    lat: Number,
    lon: Number,
    city: String,
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  apiSource: { type: String, enum: ['openweather', 'waqi', 'tomtom'], required: true },
  rawData: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('RiskEvent', riskEventSchema);
