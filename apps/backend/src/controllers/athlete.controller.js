import Athlete from '../models/Athlete.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAthletes = async (req, res, next) => {
  try {
    const { sessionId, gender, weightCategory } = req.query;
    
    const filter = {};
    if (sessionId) filter.sessions = sessionId;
    if (gender) filter.gender = gender;
    if (weightCategory) filter.weightCategory = weightCategory;

    const athletes = await Athlete.find(filter).populate('sessions').sort('startNumber');

    res.status(200).json({
      success: true,
      count: athletes.length,
      data: athletes,
    });
  } catch (error) {
    next(error);
  }
};

export const getAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findById(req.params.id).populate('sessions');

    if (!athlete) {
      throw new AppError('Athlete not found', 404);
    }

    res.status(200).json({
      success: true,
      data: athlete,
    });
  } catch (error) {
    next(error);
  }
};

export const createAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.create(req.body);

    res.status(201).json({
      success: true,
      data: athlete,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!athlete) {
      throw new AppError('Athlete not found', 404);
    }

    res.status(200).json({
      success: true,
      data: athlete,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAthlete = async (req, res, next) => {
  try {
    const athlete = await Athlete.findByIdAndDelete(req.params.id);

    if (!athlete) {
      throw new AppError('Athlete not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
