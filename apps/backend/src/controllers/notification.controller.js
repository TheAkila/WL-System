import { AppError } from '../middleware/errorHandler.js';

/**
 * Send announcement to session
 */
export const sendAnnouncement = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message, type } = req.body;

    if (!message) {
      throw new AppError('Message is required', 400);
    }

    const io = req.app.get('io');
    const announcement = {
      sessionId,
      message,
      type: type || 'info', // info, warning, success, error
      timestamp: new Date(),
    };

    // Broadcast to all clients in session
    io.to(`session:${sessionId}`).emit('announcement', announcement);

    res.status(200).json({
      success: true,
      message: 'Announcement sent',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Call athlete to platform (on-deck notification)
 */
export const callAthlete = async (req, res, next) => {
  try {
    const { sessionId, athleteId } = req.params;
    const { position } = req.body; // 'current', 'on-deck', 'in-hole'

    const io = req.app.get('io');
    const notification = {
      sessionId,
      athleteId,
      position: position || 'current',
      timestamp: new Date(),
    };

    // Broadcast athlete call-up
    io.to(`session:${sessionId}`).emit('athlete:called', notification);

    res.status(200).json({
      success: true,
      message: `Athlete called: ${position}`,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send system notification
 */
export const sendNotification = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { title, message, priority } = req.body;

    const io = req.app.get('io');
    const notification = {
      sessionId,
      title,
      message,
      priority: priority || 'normal', // low, normal, high, urgent
      timestamp: new Date(),
    };

    io.to(`session:${sessionId}`).emit('notification', notification);

    res.status(200).json({
      success: true,
      message: 'Notification sent',
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};
