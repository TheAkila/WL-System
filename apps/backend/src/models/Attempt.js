import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema(
  {
    athlete: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Athlete',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
    },
    liftType: {
      type: String,
      enum: ['snatch', 'cleanAndJerk'],
      required: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    weight: {
      type: Number,
      required: true,
      min: 1,
    },
    result: {
      type: String,
      enum: ['pending', 'good', 'no-lift'],
      default: 'pending',
    },
    refereeDecisions: {
      left: {
        type: String,
        enum: ['good', 'no-lift', null],
        default: null,
      },
      center: {
        type: String,
        enum: ['good', 'no-lift', null],
        default: null,
      },
      right: {
        type: String,
        enum: ['good', 'no-lift', null],
        default: null,
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    recordType: {
      type: String,
      enum: ['none', 'national', 'continental', 'world'],
      default: 'none',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate attempt result based on referee decisions
attemptSchema.methods.calculateResult = function () {
  const { left, center, right } = this.refereeDecisions;
  
  if (!left || !center || !right) {
    this.result = 'pending';
    return;
  }

  const goodCount = [left, center, right].filter((d) => d === 'good').length;
  this.result = goodCount >= 2 ? 'good' : 'no-lift';
};

export default mongoose.model('Attempt', attemptSchema);
