const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "teacher"], default: "student" },
    studentId: { type: String, trim: true, default: "" },
    className: { type: String, trim: true, default: "BCA-4A" },
    university: { type: String, default: "Presidency University, Bangalore" },
    course: { type: String, default: "BCA General 4th Semester" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

