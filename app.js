require('dotenv').config({ quiet: true });
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const createError = require('http-errors');

const app = express();

// Needed for correct visitor IPs (rate limiting) when hosted behind a proxy.
app.set('trust proxy', 1);

app.use(helmet());

// Only the websites listed in CORS_ORIGINS may call this API from a browser.
// If CORS_ORIGINS is not set, local development addresses are allowed.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    // Requests without an Origin (curl, Postman, server-to-server) are allowed.
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  }
}));

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/', (req, res) => res.json({ success: true, message: 'Portfolio API is running.' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/references', require('./routes/references'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/users', require('./routes/users'));

// 404 handler
app.use((req, res, next) => {
  next(createError(404, 'Not found.'));
});

// Global error handler: clear messages for user mistakes, no internal details otherwise.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(' ');
    return res.status(400).json({ success: false, message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: `Invalid value for ${err.path}.` });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'That email is already in use.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON.' });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Something went wrong on the server.' : err.message
  });
});

module.exports = app;
