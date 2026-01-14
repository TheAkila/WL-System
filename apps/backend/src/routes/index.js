import authRoutes from './auth.routes.js';
import competitionRoutes from './competition.routes.js';
import athleteRoutes from './athlete.routes.js';
import attemptRoutes from './attempt.routes.js';
import sessionRoutes from './session.routes.js';
import technicalRoutes from './technical.routes.js';

export const setupRoutes = (app) => {
  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/competitions', competitionRoutes);
  app.use('/api/athletes', athleteRoutes);
  app.use('/api/attempts', attemptRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/technical', technicalRoutes);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });
};
