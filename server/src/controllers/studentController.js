const User = require("../models/User");
const PerformanceRecord = require("../models/PerformanceRecord");
const StudyPlan = require("../models/StudyPlan");

async function listStudents(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required." });
  }

  const className = req.user.className || "BCA-4A";
  const students = await User.find({ role: "student", className })
    .select("_id name email studentId className")
    .sort({ name: 1 });
  res.json(students);
}

async function getStudentSnapshot(req, res) {
  const student = await User.findById(req.params.id).select("-password");
  if (!student) return res.status(404).json({ message: "Student not found" });

  if (req.user.role !== "teacher" && req.user._id.toString() !== student._id.toString()) {
    return res.status(403).json({ message: "Access denied." });
  }

  const records = await PerformanceRecord.find({ student: student._id }).sort({ weekStart: -1 }).limit(12);
  const plan = await StudyPlan.findOne({ student: student._id });

  res.json({ student, records, plan });
}

module.exports = { listStudents, getStudentSnapshot };
