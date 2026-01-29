const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { errorHandler } = require('./middleware/errorHandler.js');
const { setupMiddleware } = require('./middleware/index.js');
const { setupRoutes } = require('./routes/index.js');
const { setupSocketIO } = require('./socket/index.js');
const logger = require('./utils/logger.js');
const seedDefaultUsers = require('./utils/seedUsers.js');
const initializeStorageBuckets = require('./services/storageSetup.js');

const app = express();
const httpServer = createServer(app);

// Add root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Admin Backend is running', version: '1.0.0' });
});

// Setup allowed origins for Socket.IO
const allowedOrigins = process.env.SOCKET_IO_CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Configure HTTP server timeouts for file uploads
// Increased significantly to handle slow connections
httpServer.setTimeout(30 * 60 * 1000); // 30 minutes
httpServer.keepAliveTimeout = 31 * 60 * 1000; // 31 minutes
httpServer.headersTimeout = 32 * 60 * 1000; // 32 minutes

// Supabase is initialized in services/database.js - no need to connect here
logger.info('📊 Using Supabase PostgreSQL database');
logger.info('⏱️  Server timeout: 30 minutes for uploads');

// Setup middleware
try {
  setupMiddleware(app);
} catch (err) {
  logger.error('Failed to setup middleware:', err);
}

// Make io accessible to routes
app.set('io', io);

// Setup routes
try {
  setupRoutes(app);
} catch (err) {
  logger.error('Failed to setup routes:', err);
  // Add fallback health route for Vercel
  app.get('/health', (req, res) => {
    res.json({ ok: true, now: Date.now() });
  });
}

// Setup Socket.IO
try {
  setupSocketIO(io);
} catch (err) {
  logger.error('Failed to setup Socket.IO:', err);
}

// Error handler (must be last)
app.use(errorHandler);

// Start server (only in local/development, not on Vercel)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV === 'production';

if (!isVercel && process.env.NODE_ENV !== 'production') {
  httpServer.listen(PORT, async () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📡 Socket.IO server ready`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize storage buckets
    try {
      await initializeStorageBuckets();
    } catch (error) {
      logger.error('Failed to initialize storage buckets:', error);
    }
    
    // Seed default users on startup (development only)
    if (process.env.NODE_ENV !== 'production') {
      seedDefaultUsers().catch(err => logger.error('Seed failed:', err));
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing server gracefully');
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  });
} else {
  // Vercel serverless - initialize storage and seed on cold start
  logger.info('🚀 Running on Vercel (serverless)');
  initializeStorageBuckets().catch(err => logger.error('Storage init failed:', err));
}

module.exports = app;
module.exports.app = app;
module.exports.httpServer = httpServer;
module.exports.io = io;
