import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide session name'],
      trim: true,
    },
    weightCategory: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    currentLift: {
      type: String,
      enum: ['snatch', 'cleanAndJerk'],
      default: 'snatch',
    },
    athletes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Athlete',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Session', sessionSchema);
