const User = require('../models/User');
const { generateToken } = require('../utils/helpers');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, deliveryPlatform, city } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, phone, password, deliveryPlatform, city });
    res.status(201).json({ token: generateToken(user._id), user: { id: user._id, name, email, role: user.role, onboardingComplete: false } });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (user.isBlocked)
      return res.status(403).json({ message: 'ACCOUNT_BLOCKED' });

    res.json({ token: generateToken(user._id), user: { id: user._id, name: user.name, email, role: user.role, onboardingComplete: user.onboardingComplete } });
  } catch (err) { next(err); }
};

const getMe = async (req, res) => {
  // Always fetch fresh from DB so loyaltyPoints/riskScore are up to date
  const u = await User.findById(req.user._id);
  res.json({
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    city: u.city,
    role: u.role,
    deliveryPlatform: u.deliveryPlatform,
    avgDailyIncome: u.avgDailyIncome,
    workingHours: u.workingHours,
    deliveryZones: u.deliveryZones,
    bankAccount: u.bankAccount,
    onboardingComplete: u.onboardingComplete,
    loyaltyPoints: u.loyaltyPoints || 0,
    riskScore:     u.riskScore     || 0,
    fraudEvents:   u.fraudEvents   || 0,
  });
};

module.exports = { register, login, getMe };
