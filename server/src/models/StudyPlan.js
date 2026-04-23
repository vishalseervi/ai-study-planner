const mongoose = require("mongoose");

const studyPlanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    generatedAt: { type: Date, required: true, default: Date.now },
    recommendation: { type: String, required: true },
    confidenceBand: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    subjectPlans: [
      {
        subject: { type: String, required: true },
        predictedScore: { type: Number, required: true },
        targetScore: { type: Number, required: true },
        suggestedWeeklyHours: { type: Number, required: true },
        action: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyPlan", studyPlanSchema);
