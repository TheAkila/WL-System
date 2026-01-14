import Session from '../models/Session.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSessions = async (req, res, next) => {
  try {
    const { competitionId, status } = req.query;
    
    const filter = {};
    if (competitionId) filter.competition = competitionId;
    if (status) filter.status = status;

    const sessions = await Session.find(filter)
      .populate('competition')
      .populate('athletes')
      .sort('startTime');

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('competition')
      .populate('athletes');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const session = await Session.create(req.body);
    await session.populate('competition athletes');

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('competition athletes');

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    // Emit socket event
    req.app.get('io').emit('session:updated', session);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    session.status = 'in-progress';
    session.startTime = new Date();
    await session.save();
    await session.populate('competition athletes');

    // Emit socket event
    req.app.get('io').emit('session:started', session);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    session.status = 'completed';
    session.endTime = new Date();
    await session.save();
    await session.populate('competition athletes');

    // Emit socket event
    req.app.get('io').emit('session:ended', session);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
