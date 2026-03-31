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
const ocrRoutes     = require('./routes/ocrRoutes');

const app = express();

app.use(helmet());
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/plans',
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api', policyRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/payout', payoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', premiumRoutes);
app.use('/api/ocr',      ocrRoutes);

app.use(errorHandler);

module.exports = app;
