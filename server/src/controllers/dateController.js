const ImportantDate = require("../models/ImportantDate");

async function getDates(req, res) {
  const dates = await ImportantDate.find({ user: req.user._id }).sort({ date: 1, createdAt: -1 });
  res.json(dates);
}

async function createDate(req, res) {
  const { title, date, note } = req.body;
  if (!title || !date) return res.status(400).json({ message: "title and date are required" });
  const item = await ImportantDate.create({
    user: req.user._id,
    title,
    date,
    note: note || "",
  });
  res.status(201).json(item);
}

async function deleteDate(req, res) {
  const deleted = await ImportantDate.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) return res.status(404).json({ message: "Date not found" });
  res.json({ ok: true });
}

module.exports = { getDates, createDate, deleteDate };

