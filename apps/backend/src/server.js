import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { setupMiddleware } from './middleware/index.js';
import { setupRoutes } from './routes/index.js';
import { setupSocketIO } from './socket/index.js';
import logger from './utils/logger.js';
import seedDefaultUsers from './utils/seedUsers.js';
import initializeStorageBuckets from './services/storageSetup.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

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
setupMiddleware(app);

// Make io accessible to routes
app.set('io', io);

// Setup routes
setupRoutes(app);

// Setup Socket.IO
setupSocketIO(io);

// Error handler (must be last)
app.use(errorHandler);

// Start server
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

export { app, httpServer, io };
