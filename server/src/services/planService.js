function nextWeeklyHours(predictedScore, currentHours) {
  if (predictedScore < 50) return Math.round(currentHours * 1.4 * 10) / 10;
  if (predictedScore < 65) return Math.round(currentHours * 1.25 * 10) / 10;
  if (predictedScore < 80) return Math.round(currentHours * 1.1 * 10) / 10;
  return Math.max(4, Math.round(currentHours * 0.95 * 10) / 10);
}

function buildAdaptivePlan({ records, predictions }) {
  const subjectPlans = records.map((record) => {
    const predicted = predictions[record.subject] || 0;
    const targetScore = Math.max(record.previousScore + 8, 75);
    const suggestedWeeklyHours = nextWeeklyHours(predicted, record.studyHours);

    let action = "Maintain current pace and attempt one timed mock test this week.";
    if (predicted < 55) {
      action =
        "Increase revision frequency, split chapters into smaller goals, and solve two practice sets.";
    } else if (predicted < 70) {
      action = "Increase practice questions and add one focused doubt-clearing session.";
    } else if (predicted > 85) {
      action = "Keep consistency and mentor peers once this week to reinforce understanding.";
    }

    return {
      subject: record.subject,
      predictedScore: Number(predicted.toFixed(2)),
      targetScore,
      suggestedWeeklyHours,
      action,
    };
  });

  const lowSubjects = subjectPlans.filter((plan) => plan.predictedScore < 60).map((plan) => plan.subject);
  const recommendation =
    lowSubjects.length > 0
      ? `Focus on ${lowSubjects.join(", ")}. Increase weekly hours and track assignment completion daily.`
      : "Performance is stable. Focus on mock tests and consistency to sustain high scores.";

  const averagePrediction =
    subjectPlans.reduce((sum, row) => sum + row.predictedScore, 0) / Math.max(subjectPlans.length, 1);
  const confidenceBand = averagePrediction > 80 ? "high" : averagePrediction > 65 ? "medium" : "low";

  return {
    generatedAt: new Date(),
    recommendation,
    confidenceBand,
    subjectPlans,
  };
}

module.exports = { buildAdaptivePlan };
