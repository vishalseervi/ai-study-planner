const PerformanceRecord = require("../models/PerformanceRecord");

const FEATURE_KEYS = [
  "studyHours",
  "sleepHours",
  "attendance",
  "previousScore",
  "subjectDifficulty",
  "assignmentCompletion",
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRows(rows, featureStats) {
  return rows.map((row) =>
    FEATURE_KEYS.map((key) => {
      const min = featureStats[key].min;
      const max = featureStats[key].max;
      if (max === min) return 0;
      return (row[key] - min) / (max - min);
    })
  );
}

function computeFeatureStats(rows) {
  const stats = {};
  FEATURE_KEYS.forEach((key) => {
    const values = rows.map((row) => row[key]);
    stats[key] = {
      min: Math.min(...values),
      max: Math.max(...values),
      mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    };
  });
  return stats;
}

function trainLinearRegression(records) {
  if (records.length < 10) {
    return null;
  }

  const featureStats = computeFeatureStats(records);
  const x = normalizeRows(records, featureStats);
  const y = records.map((row) => row.score / 100);

  let weights = new Array(FEATURE_KEYS.length).fill(0);
  let bias = 0;
  const learningRate = 0.05;
  const epochs = 1200;
  const n = records.length;

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const gradW = new Array(weights.length).fill(0);
    let gradB = 0;

    for (let i = 0; i < n; i += 1) {
      const prediction = x[i].reduce((sum, value, idx) => sum + value * weights[idx], bias);
      const error = prediction - y[i];
      gradB += error;
      for (let j = 0; j < weights.length; j += 1) {
        gradW[j] += error * x[i][j];
      }
    }

    for (let j = 0; j < weights.length; j += 1) {
      weights[j] -= (learningRate * gradW[j]) / n;
    }
    bias -= (learningRate * gradB) / n;
  }

  const predictions = x.map((row) => row.reduce((sum, value, idx) => sum + value * weights[idx], bias));
  const mae =
    (predictions.reduce((sum, p, idx) => sum + Math.abs(p - y[idx]), 0) / n) * 100;

  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  const ssTot = y.reduce((sum, value) => sum + (value - meanY) ** 2, 0);
  const ssRes = y.reduce((sum, value, idx) => sum + (value - predictions[idx]) ** 2, 0);
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

  return {
    featureKeys: FEATURE_KEYS,
    featureStats,
    weights,
    bias,
    metrics: {
      mae: Number(mae.toFixed(2)),
      r2: Number(r2.toFixed(4)),
      samples: n,
    },
  };
}

function predictScore(model, featureRow) {
  if (!model) return 0;

  const normalized = model.featureKeys.map((key) => {
    const min = model.featureStats[key].min;
    const max = model.featureStats[key].max;
    if (max === min) return 0;
    return (featureRow[key] - min) / (max - min);
  });

  const prediction01 = normalized.reduce(
    (sum, value, idx) => sum + value * model.weights[idx],
    model.bias
  );

  return Number(clamp(prediction01 * 100, 0, 100).toFixed(2));
}

async function trainModelFromDatabase() {
  const records = await PerformanceRecord.find().lean();
  return trainLinearRegression(records);
}

module.exports = {
  FEATURE_KEYS,
  trainModelFromDatabase,
  trainLinearRegression,
  predictScore,
};
