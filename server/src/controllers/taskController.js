const { validationResult } = require("express-validator");
const Task = require("../models/Task");

async function getTasks(req, res) {
  const { status, sort = "dueDate" } = req.query;
  const filter = { user: req.user._id };
  if (status && ["pending", "in_progress", "completed"].includes(status)) filter.status = status;

  const tasks = await Task.find(filter).sort({ [sort]: 1, createdAt: -1 });
  res.json(tasks);
}

async function createTask(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });

  const task = await Task.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(task);
}

async function updateTask(req, res) {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
}

async function deleteTask(req, res) {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.json({ ok: true });
}

module.exports = { getTasks, createTask, updateTask, deleteTask };

