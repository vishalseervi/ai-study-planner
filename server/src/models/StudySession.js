const mongoose = require("mongoose");

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    minutes: { type: Number, required: true, min: 0, max: 1000 },
    notes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudySession", studySessionSchema);

