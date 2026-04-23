const mongoose = require("mongoose");

const aiChatJobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clientRequestId: { type: String, default: "", index: true },
    message: { type: String, required: true, trim: true },
    model: { type: String, default: "" },
    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
      index: true,
    },
    reply: { type: String, default: "" },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiChatJob", aiChatJobSchema);

