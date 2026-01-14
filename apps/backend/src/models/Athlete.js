import mongoose from 'mongoose';

const athleteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide athlete name'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
    },
    weightCategory: {
      type: String,
      required: [true, 'Please provide weight category'],
    },
    bodyWeight: {
      type: Number,
    },
    teamOrClub: {
      type: String,
      trim: true,
    },
    startNumber: {
      type: Number,
    },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Athlete', athleteSchema);
