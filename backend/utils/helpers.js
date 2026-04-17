const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Claim formula: hourly = avgDailyIncome / workingHoursPerDay, claim = hourly × 6
const logger = require('../utils/logger');

const calculateClaim = (avgDailyIncome, workingHoursPerDay, maxWeeklyPayout) => {
  const income = Number(avgDailyIncome);
  const hours  = Number(workingHoursPerDay) || 8;
  if (!income || income <= 0) return { hourlyIncome: 0, claimAmount: 0 };
  const DISRUPTION_HOURS = 6;
  const hourly = income / hours;
  const raw    = Math.round(hourly * DISRUPTION_HOURS);
  return {
    hourlyIncome: Math.round(hourly * 100) / 100,
    claimAmount:  maxWeeklyPayout ? Math.min(raw, maxWeeklyPayout) : raw,
  };
};

const calcIncomeLoss = (avgDailyIncome, workingHours, severityFactor) => {
  const hourlyRate = avgDailyIncome / workingHours;
  return Math.round(hourlyRate * workingHours * severityFactor);
};

const getSeverityFactor = (disruptionType, value) => {
  const factors = {
    heavy_rain: value > 100 ? 1.0 : value > 75 ? 0.75 : 0.5,
    extreme_heat: value > 48 ? 1.0 : value > 45 ? 0.75 : 0.5,
    aqi_hazard: value > 400 ? 1.0 : value > 350 ? 0.75 : 0.5,
    traffic_jam: value < 0.2 ? 1.0 : value < 0.3 ? 0.75 : 0.5,
  };
  return factors[disruptionType] || 0.5;
};

module.exports = { generateToken, calcIncomeLoss, getSeverityFactor, calculateClaim };
