import mongoose from 'mongoose';

const competitionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a competition name'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide a competition date'],
    },
    location: {
      type: String,
      required: [true, 'Please provide a location'],
      trim: true,
    },
    organizer: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
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

export default mongoose.model('Competition', competitionSchema);
