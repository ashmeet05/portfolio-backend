require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const createError = require('http-errors');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/references', require('./routes/references'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/users', require('./routes/users'));

// 404 handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message
  });
});

module.exports = app;