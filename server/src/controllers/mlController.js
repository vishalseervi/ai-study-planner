const User = require("../models/User");
const PerformanceRecord = require("../models/PerformanceRecord");
const StudyPlan = require("../models/StudyPlan");
const { trainModelFromDatabase, predictScore } = require("../services/mlService");
const { buildAdaptivePlan } = require("../services/planService");
const bcrypt = require("bcryptjs");

const SUBJECTS = ["Mathematics", "Physics", "Programming", "Database", "English"];

let cachedModel = null;
let cachedAt = 0;

function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function syntheticScore(features) {
  const base =
    20 +
    features.studyHours * 2.8 +
    features.sleepHours * 3.5 +
    features.attendance * 0.2 +
    features.previousScore * 0.35 +
    features.assignmentCompletion * 0.18 -
    features.subjectDifficulty * 3.2;
  const noise = randomInRange(-7, 7);
  return Math.max(30, Math.min(98, Math.round(base + noise)));
}

async function getOrTrainModel(forceRetrain = false) {
  const stale = Date.now() - cachedAt > 1000 * 60 * 10;
  if (!cachedModel || stale || forceRetrain) {
    cachedModel = await trainModelFromDatabase();
    cachedAt = Date.now();
  }
  return cachedModel;
}

async function seedSampleDataset(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Only teachers can seed sample data." });
  }

  const className = req.user.className || "BCA-4A";
  const studentsToCreate = 20;
  const recordsPerStudent = 5;
  const inserts = [];
  const defaultPassword = await bcrypt.hash("student123", 10);

  for (let i = 0; i < studentsToCreate; i += 1) {
    const sid = `STU-${String(i + 1).padStart(3, "0")}`;
    const email = `${sid.toLowerCase()}@college.demo`;

    let student = await User.findOne({ email });
    if (!student) {
      student = await User.create({
        name: `Student ${i + 1}`,
        email,
        password: defaultPassword,
        role: "student",
        studentId: sid,
        className,
      });
    }

    for (let j = 0; j < recordsPerStudent; j += 1) {
      const subject = SUBJECTS[j % SUBJECTS.length];
      const studyHours = Number(randomInRange(4, 20).toFixed(1));
      const sleepHours = Number(randomInRange(5, 9).toFixed(1));
      const attendance = Math.round(randomInRange(58, 100));
      const previousScore = Math.round(randomInRange(40, 92));
      const subjectDifficulty = Math.round(randomInRange(1, 5));
      const assignmentCompletion = Math.round(randomInRange(50, 100));
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - j * 7);

      const score = syntheticScore({
        studyHours,
        sleepHours,
        attendance,
        previousScore,
        subjectDifficulty,
        assignmentCompletion,
      });

      inserts.push({
        updateOne: {
          filter: { student: student._id, subject, weekStart },
          update: {
            $set: {
              student: student._id,
              studentId: student.studentId || sid,
              subject,
              weekStart,
              studyHours,
              sleepHours,
              attendance,
              previousScore,
              subjectDifficulty,
              assignmentCompletion,
              score,
            },
          },
          upsert: true,
        },
      });
    }
  }

  if (inserts.length > 0) {
    await PerformanceRecord.bulkWrite(inserts);
  }

  const model = await getOrTrainModel(true);
  if (model) {
    const all = await PerformanceRecord.find();
    for (const record of all) {
      record.predictedScore = predictScore(model, record);
      await record.save();
    }
  }

  res.json({
    message: "Sample dataset created",
    totalEntries: inserts.length,
    modelMetrics: model ? model.metrics : null,
  });
}

async function clearSampleDataset(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Only teachers can clear sample data." });
  }

  await PerformanceRecord.deleteMany({});
  await StudyPlan.deleteMany({});

  cachedModel = null;
  cachedAt = 0;

  res.json({
    message: "Sample dataset cleared",
  });
}

async function createPerformanceRecord(req, res) {
  const payload = {
    student: req.user._id,
    studentId: req.user.studentId || req.user.id,
    ...req.body,
  };

  const model = await getOrTrainModel();
  payload.predictedScore = model ? predictScore(model, payload) : undefined;

  const record = await PerformanceRecord.create(payload);
  res.status(201).json(record);
}

async function createPerformanceRecordForStudent(req, res) {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Only teachers can add records for students." });
  }

  const { studentId, ...input } = req.body;
  const student = await User.findById(studentId);
  if (!student || student.role !== "student") {
    return res.status(404).json({ message: "Student not found." });
  }

  const payload = {
    student: student._id,
    studentId: student.studentId || String(student._id),
    ...input,
  };

  const model = await getOrTrainModel();
  payload.predictedScore = model ? predictScore(model, payload) : undefined;

  const record = await PerformanceRecord.create(payload);
  res.status(201).json(record);
}

async function getMyPerformance(req, res) {
  const records = await PerformanceRecord.find({ student: req.user._id }).sort({ weekStart: -1 });
  res.json(records);
}

async function getPrediction(req, res) {
  const model = await getOrTrainModel();
  if (!model) {
    return res.status(400).json({ message: "Not enough training data. Seed sample dataset first." });
  }

  const latestPerSubject = await PerformanceRecord.aggregate([
    { $match: { student: req.user._id } },
    { $sort: { weekStart: -1 } },
    {
      $group: {
        _id: "$subject",
        record: { $first: "$$ROOT" },
      },
    },
  ]);

  const predictions = {};
  latestPerSubject.forEach((entry) => {
    predictions[entry._id] = predictScore(model, entry.record);
  });

  const planData = buildAdaptivePlan({
    records: latestPerSubject.map((entry) => entry.record),
    predictions,
  });

  const savedPlan = await StudyPlan.findOneAndUpdate(
    { student: req.user._id },
    { student: req.user._id, ...planData },
    { new: true, upsert: true }
  );

  res.json({
    modelMetrics: model.metrics,
    predictions,
    adaptivePlan: savedPlan,
  });
}

module.exports = {
  seedSampleDataset,
  clearSampleDataset,
  createPerformanceRecord,
  createPerformanceRecordForStudent,
  getMyPerformance,
  getPrediction,
};
