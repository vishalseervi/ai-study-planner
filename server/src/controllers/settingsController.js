const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Task = require("../models/Task");
const StudySession = require("../models/StudySession");
const ImportantDate = require("../models/ImportantDate");

async function updateProfile(req, res) {
  const { name, university, course, password } = req.body;
  const updates = { name, university, course };
  if (password) updates.password = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
  res.json({ user });
}

async function resetAllTasks(req, res) {
  await Task.deleteMany({ user: req.user._id });
  await StudySession.deleteMany({ user: req.user._id });
  await ImportantDate.deleteMany({ user: req.user._id });
  res.json({ ok: true });
}

module.exports = { updateProfile, resetAllTasks };

