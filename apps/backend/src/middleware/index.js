const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger.js');

const setupMiddleware = (app) => {
  // Security headers
  app.use(helmet());

  // CORS
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  // Body parsing with increased limits for uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Compression
  app.use(compression());

  // HTTP request logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(
      morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) },
      })
    );
  }

  // Rate limiting - generous limits for development, skip uploads
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per 15 minutes
    message: 'Too many requests from this IP, please try again later.',
    skip: (req) => {
      // Skip rate limit for uploads and health checks
      // Check both originalUrl (full path) and path (route path)
      const fullUrl = req.originalUrl || '';
      const path = req.path || '';
      return fullUrl.includes('/uploads') || path.includes('/uploads') || path === '/health';
    },
    standardHeaders: false, // Don't return rate limit info in headers
    legacyHeaders: false, // Don't return RateLimit-* headers
  });
  app.use('/api/', limiter);
  app.use('/api/', limiter);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};

module.exports = { setupMiddleware };
