import Competition from '../models/Competition.js';
import { AppError } from '../middleware/errorHandler.js';

export const getCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.find().populate('sessions').sort('-date');

    res.status(200).json({
      success: true,
      count: competitions.length,
      data: competitions,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id).populate('sessions');

    if (!competition) {
      throw new AppError('Competition not found', 404);
    }

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findOne({ status: 'active' }).populate('sessions');

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
};

export const createCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.create(req.body);

    res.status(201).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!competition) {
      throw new AppError('Competition not found', 404);
    }

    // Emit socket event
    req.app.get('io').emit('competition:updated', competition);

    res.status(200).json({
      success: true,
      data: competition,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);

    if (!competition) {
      throw new AppError('Competition not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
