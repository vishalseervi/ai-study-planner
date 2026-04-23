const User = require("../models/User");
const PerformanceRecord = require("../models/PerformanceRecord");

async function teacherClassAnalytics(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access required." });
  }

  const className = req.user.className || "BCA-4A";
  const students = await User.find({ role: "student", className }).select("_id name studentId");
  const studentIds = students.map((student) => student._id);

  const records = await PerformanceRecord.find({ student: { $in: studentIds } });
  const totalScore = records.reduce((sum, row) => sum + row.score, 0);
  const averageClassPerformance = records.length ? Number((totalScore / records.length).toFixed(2)) : 0;

  const scoreByStudent = {};
  records.forEach((row) => {
    if (!scoreByStudent[row.student.toString()]) scoreByStudent[row.student.toString()] = [];
    scoreByStudent[row.student.toString()].push(row.score);
  });

  const weakStudents = students
    .map((student) => {
      const values = scoreByStudent[student._id.toString()] || [];
      const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
      return {
        studentId: student.studentId,
        name: student.name,
        averageScore: Number(avg.toFixed(2)),
      };
    })
    .filter((row) => row.averageScore < 60)
    .sort((a, b) => a.averageScore - b.averageScore);

  const subjectTrendMap = {};
  records.forEach((row) => {
    if (!subjectTrendMap[row.subject]) subjectTrendMap[row.subject] = [];
    subjectTrendMap[row.subject].push(row.score);
  });
  const subjectTrends = Object.entries(subjectTrendMap).map(([subject, values]) => ({
    subject,
    avgScore: Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)),
    totalRecords: values.length,
  }));

  const studentComparison = students
    .map((student) => {
      const rows = records.filter((record) => record.student.toString() === student._id.toString());
      const latest = rows.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))[0];
      return {
        studentId: student.studentId,
        name: student.name,
        latestScore: latest ? latest.score : 0,
        latestPredictedScore: latest ? latest.predictedScore || 0 : 0,
      };
    })
    .sort((a, b) => b.latestScore - a.latestScore);

  res.json({
    className,
    totalStudents: students.length,
    averageClassPerformance,
    weakStudents,
    subjectTrends,
    studentComparison,
  });
}

module.exports = { teacherClassAnalytics };
