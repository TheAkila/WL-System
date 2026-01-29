const authRoutes = require('./auth.routes.js');
const competitionRoutes = require('./competition.routes.js');
const athleteRoutes = require('./athlete.routes.js');
const attemptRoutes = require('./attempt.routes.js');
const sessionRoutes = require('./session.routes.js');
const sessionStateRoutes = require('./sessionState.routes.js');
const technicalRoutes = require('./technical.routes.js');
const timerRoutes = require('./timer.routes.js');
const teamRoutes = require('./team.routes.js');
const notificationRoutes = require('./notification.routes.js');
const uploadRoutes = require('./upload.routes.js');
// Temporarily disabled - pdfkit is ES module and causes issues
// const exportRoutes = require('./export.routes.js');
const adminRoutes = require('./admin.routes.js');
const resultsRoutes = require('./results.routes.js');
const liftingOrderRoutes = require('./liftingOrder.routes.js');
const weightChangeRoutes = require('./weightChange.routes.js');
const sheetRoutes = require('./sheet.routes.js');

const setupRoutes = (app) => {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/competitions', competitionRoutes);
  app.use('/api/athletes', athleteRoutes);
  app.use('/api/attempts', attemptRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/sessions', sessionStateRoutes);
  app.use('/api/technical', technicalRoutes);
  app.use('/api/timer', timerRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/uploads', uploadRoutes);
  // app.use('/api/exports', exportRoutes);  // Temporarily disabled
  app.use('/api/admin', adminRoutes);
  app.use('/api/results', resultsRoutes);
  app.use('/api/sessions', liftingOrderRoutes);
  app.use('/api/weight-changes', weightChangeRoutes);
  app.use('/api/technical', sheetRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });
};

module.exports = { setupRoutes };
