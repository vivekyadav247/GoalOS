const mongoose = require('mongoose');

const weekPlanSchema = new mongoose.Schema(
  {
    monthId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MonthPlan',
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 53,
    },
    description: {
      type: String,
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

module.exports = mongoose.model('WeekPlan', weekPlanSchema);

