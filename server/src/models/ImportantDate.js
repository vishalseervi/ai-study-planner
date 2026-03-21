const mongoose = require("mongoose");

const importantDateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    note: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportantDate", importantDateSchema);
