const Task = require("../models/Task");
const AiChatJob = require("../models/AiChatJob");
const { askAiStudyCoach } = require("../services/aiService");

async function chat(req, res) {
  const { message, model } = req.body;
  if (!message) return res.status(400).json({ message: "message is required" });

  const reply = await askAiStudyCoach({ message, model });
  res.json({ reply });
}

async function runAiJob(jobId) {
  const job = await AiChatJob.findById(jobId);
  if (!job) return;

  job.status = "processing";
  job.error = "";
  await job.save();

  try {
    const reply = await askAiStudyCoach({ message: job.message, model: job.model });
    job.reply = reply;
    job.status = "completed";
    await job.save();
  } catch (error) {
    job.status = "failed";
    job.error = error.message || "AI job failed";
    await job.save();
  }
}

async function createChatJob(req, res) {
  const { message, model, clientRequestId } = req.body;
  if (!message) return res.status(400).json({ message: "message is required" });

  const job = await AiChatJob.create({
    user: req.user._id,
    message,
    model: model || "",
    clientRequestId: clientRequestId || "",
    status: "queued",
  });

  runAiJob(job._id).catch((error) => {
    console.error("Background AI job failed:", error.message);
  });

  res.status(202).json({
    job: {
      id: job._id,
      clientRequestId: job.clientRequestId,
      status: job.status,
      createdAt: job.createdAt,
    },
  });
}

async function getChatJob(req, res) {
  const job = await AiChatJob.findOne({ _id: req.params.id, user: req.user._id });
  if (!job) return res.status(404).json({ message: "Job not found" });

  res.json({
    job: {
      id: job._id,
      clientRequestId: job.clientRequestId,
      status: job.status,
      reply: job.reply,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    },
  });
}

async function getChatJobsByIds(req, res) {
  const ids = String(req.query.ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) return res.json({ jobs: [] });

  const jobs = await AiChatJob.find({ _id: { $in: ids }, user: req.user._id }).sort({ createdAt: -1 });
  res.json({
    jobs: jobs.map((job) => ({
      id: job._id,
      clientRequestId: job.clientRequestId,
      status: job.status,
      reply: job.reply,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  });
}

async function getRecentChatJobs(req, res) {
  const parsed = Number(req.query.limit);
  const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 30;
  const jobs = await AiChatJob.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit);

  res.json({
    jobs: jobs.map((job) => ({
      id: job._id,
      clientRequestId: job.clientRequestId,
      message: job.message,
      status: job.status,
      reply: job.reply,
      error: job.error,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    })),
  });
}

async function chatStream(req, res) {
  const { message, model } = req.body;
  if (!message) return res.status(400).json({ message: "message is required" });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  try {
    const reply = await askAiStudyCoach({ message, model });
    const words = String(reply).split(/\s+/).filter(Boolean);
    for (const word of words) {
      send({ token: `${word} ` });
      await new Promise((resolve) => setTimeout(resolve, 38));
    }
    send({ done: true });
    res.end();
  } catch (error) {
    send({ error: error.message || "AI streaming failed" });
    res.end();
  }
}

async function suggestPlan(req, res) {
  const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
  const compactTasks = tasks.slice(0, 10).map((t) => ({
    title: t.title,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
  }));

  const prompt = `Generate a daily study plan for this student based on tasks:\n${JSON.stringify(
    compactTasks
  )}`;
  const reply = await askAiStudyCoach({ message: prompt });
  res.json({ reply });
}

module.exports = {
  chat,
  chatStream,
  createChatJob,
  getChatJob,
  getChatJobsByIds,
  getRecentChatJobs,
  suggestPlan,
};

