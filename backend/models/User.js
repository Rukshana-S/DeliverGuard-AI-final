const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  deliveryPlatform: { type: String, enum: ['Zomato', 'Swiggy', 'Uber Eats', 'Amazon', 'Zepto', 'Blinkit', 'Other'] },
  city: { type: String },
  deliveryZones: [{ type: String }],
  avgDailyIncome: { type: Number, default: 0 },
  workingHours: { type: Number, default: 8 },
  bankAccount: {
    holderName: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
  },
  onboardingComplete: { type: Boolean, default: false },
  role: { type: String, enum: ['worker', 'admin'], default: 'worker' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
