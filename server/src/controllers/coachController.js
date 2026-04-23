const PerformanceRecord = require("../models/PerformanceRecord");
const StudyPlan = require("../models/StudyPlan");

function latestRecordBySubject(records) {
  const map = {};
  records.forEach((row) => {
    const existing = map[row.subject];
    if (!existing || new Date(row.weekStart) > new Date(existing.weekStart)) {
      map[row.subject] = row;
    }
  });
  return Object.values(map);
}

async function chatWithData(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: "message is required" });

  const records = await PerformanceRecord.find({ student: req.user._id }).sort({ weekStart: -1 }).limit(20);
  const latest = latestRecordBySubject(records);
  const plan = await StudyPlan.findOne({ student: req.user._id });

  if (latest.length === 0) {
    return res.json({
      reply:
        "No performance records found yet. Add at least one weekly subject record to get data-driven suggestions.",
    });
  }

  const lowSubject = latest
    .sort((a, b) => (a.predictedScore || a.score) - (b.predictedScore || b.score))[0];

  const trendLine = latest
    .map((row) => {
      const scoreUsed = row.predictedScore || row.score;
      const nextHours = Math.round(row.studyHours * (scoreUsed < 60 ? 1.3 : 1.1) * 10) / 10;
      return `${row.subject}: last=${row.score}, predicted=${scoreUsed.toFixed(1)}, study_hours=${row.studyHours}, suggested_hours=${nextHours}`;
    })
    .join("\n");

  const planHint = plan
    ? `Current adaptive plan confidence: ${plan.confidenceBand}. Recommendation: ${plan.recommendation}`
    : "No adaptive plan generated yet. Visit prediction panel to generate one.";

  const reply = `Data-aware response to: "${message}"\n\nWeakest subject right now: ${
    lowSubject.subject
  } (predicted ${(lowSubject.predictedScore || lowSubject.score).toFixed(
    1
  )}). Increase study hours by ~30% for this subject and keep attendance above 85%.\n\nSubject insights:\n${trendLine}\n\n${planHint}`;

  res.json({ reply });
}

module.exports = { chatWithData };
