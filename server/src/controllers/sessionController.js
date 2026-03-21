const StudySession = require("../models/StudySession");

async function getSessions(req, res) {
  const sessions = await StudySession.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
  res.json(sessions);
}

async function createSession(req, res) {
  const { subject, date, minutes, notes } = req.body;
  if (!subject || !date) return res.status(400).json({ message: "subject and date are required" });
  const session = await StudySession.create({
    user: req.user._id,
    subject,
    date,
    minutes: Number(minutes) || 0,
    notes: notes || "",
  });
  res.status(201).json(session);
}

async function deleteSession(req, res) {
  const deleted = await StudySession.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) return res.status(404).json({ message: "Session not found" });
  res.json({ ok: true });
}

module.exports = { getSessions, createSession, deleteSession };

