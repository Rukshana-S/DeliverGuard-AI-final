const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');
const claimRoutes = require('./routes/claimRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const adminRoutes = require('./routes/adminRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const ocrRoutes = require('./routes/ocrRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const districtRoutes = require('./routes/districtRoutes');

const app = express();

app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'https://deliverguard-frontend.onrender.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Strict rate limiter for auth routes (brute force protection)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a minute.' },
});

// General rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/plans',
});
app.use(limiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/payout', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', premiumRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/districts', districtRoutes);

// Error handler
app.use(errorHandler);

module.exports = app;