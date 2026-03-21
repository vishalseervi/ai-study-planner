const Task = require("../models/Task");
const { askAiStudyCoach } = require("../services/aiService");

async function chat(req, res) {
  const { message, model } = req.body;
  if (!message) return res.status(400).json({ message: "message is required" });

  const reply = await askAiStudyCoach({ message, model });
  res.json({ reply });
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

module.exports = { chat, suggestPlan };

