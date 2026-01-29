// Vercel serverless function entry point with error handling
let app;

try {
  const serverModule = await import('../src/server.js');
  app = serverModule.default;
} catch (error) {
  console.error('Failed to load server:', error);
  // Create a minimal Express app that reports the error
  const express = (await import('express')).default;
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      error: 'Server initialization failed',
      message: error.message,
      stack: error.stack
    });
  });
}

export default app;
