const User = require('../models/User');
const Policy = require('../models/Policy');

const getProfile = async (req, res) => res.json(req.user);

const updateProfile = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json(updated);
  } catch (err) { next(err); }
};

const completeOnboarding = async (req, res, next) => {
  try {
    const { name, phone, city, deliveryPlatform, avgDailyIncome,
            workingHours, deliveryZones, bankAccount } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, city, deliveryPlatform,
        avgDailyIncome: Number(avgDailyIncome),
        workingHours: Number(workingHours),
        deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : [],
        bankAccount,
        onboardingComplete: true },
      { new: true, runValidators: true }
    );
    res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      city: updated.city,
      role: updated.role,
      deliveryPlatform: updated.deliveryPlatform,
      avgDailyIncome: updated.avgDailyIncome,
      workingHours: updated.workingHours,
      deliveryZones: updated.deliveryZones,
      bankAccount: updated.bankAccount,
      onboardingComplete: updated.onboardingComplete,
    });
  } catch (err) { next(err); }
};

const getUserPolicies = async (req, res, next) => {
  try {
    const policies = await Policy.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(policies);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const valid = await user.comparePassword(currentPassword);
    if (!valid) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, completeOnboarding, getUserPolicies, changePassword };
