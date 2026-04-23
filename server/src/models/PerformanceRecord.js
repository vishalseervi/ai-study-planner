const mongoose = require("mongoose");

const performanceRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    studentId: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    weekStart: { type: Date, required: true },
    studyHours: { type: Number, required: true, min: 0, max: 60 },
    sleepHours: { type: Number, required: true, min: 3, max: 12 },
    attendance: { type: Number, required: true, min: 0, max: 100 },
    previousScore: { type: Number, required: true, min: 0, max: 100 },
    subjectDifficulty: { type: Number, required: true, min: 1, max: 5 },
    assignmentCompletion: { type: Number, required: true, min: 0, max: 100 },
    score: { type: Number, required: true, min: 0, max: 100 },
    predictedScore: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

performanceRecordSchema.index({ student: 1, subject: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model("PerformanceRecord", performanceRecordSchema);
