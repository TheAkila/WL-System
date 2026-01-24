import authRoutes from './auth.routes.js';
import competitionRoutes from './competition.routes.js';
import athleteRoutes from './athlete.routes.js';
import attemptRoutes from './attempt.routes.js';
import sessionRoutes from './session.routes.js';
import technicalRoutes from './technical.routes.js';
import timerRoutes from './timer.routes.js';
import teamRoutes from './team.routes.js';
import notificationRoutes from './notification.routes.js';
import uploadRoutes from './upload.routes.js';
import exportRoutes from './export.routes.js';
import adminRoutes from './admin.routes.js';
import resultsRoutes from './results.routes.js';
import liftingOrderRoutes from './liftingOrder.routes.js';
import weightChangeRoutes from './weightChange.routes.js';
import sheetRoutes from './sheet.routes.js';

export const setupRoutes = (app) => {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/competitions', competitionRoutes);
  app.use('/api/athletes', athleteRoutes);
  app.use('/api/attempts', attemptRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/technical', technicalRoutes);
  app.use('/api/timer', timerRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/uploads', uploadRoutes);
  app.use('/api/exports', exportRoutes);
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
