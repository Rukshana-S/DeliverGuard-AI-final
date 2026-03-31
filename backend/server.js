require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { startRiskMonitor } = require('./cron/riskMonitor');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

/* Handle unexpected errors */
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
});

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${PORT}`);
      startRiskMonitor();
    });
  })
  .catch((err) => {
    logger.error(`Failed to connect to DB: ${err.message}`);
    process.exit(1);
  });