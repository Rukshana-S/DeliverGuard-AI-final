const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message);
  // Mongoose validation errors are client errors, not server errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ message });
  }
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
