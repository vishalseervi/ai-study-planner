const Task = require("../models/Task");
const StudySession = require("../models/StudySession");

async function getStats(req, res) {
  const tasks = await Task.find({ user: req.user._id });
  const sessions = await StudySession.find({ user: req.user._id });

  const byStatus = { pending: 0, in_progress: 0, completed: 0 };
  const byPriority = { low: 0, medium: 0, high: 0 };
  const bySubjectTasks = {};
  const bySubjectMinutes = {};

  tasks.forEach((task) => {
    byStatus[task.status] = (byStatus[task.status] || 0) + 1;
    byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
    bySubjectTasks[task.subject] = (bySubjectTasks[task.subject] || 0) + 1;
  });

  sessions.forEach((session) => {
    bySubjectMinutes[session.subject] = (bySubjectMinutes[session.subject] || 0) + session.minutes;
  });

  const today = new Date();
  const byDayMinutes = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const minutes = sessions
      .filter((s) => {
        const d = new Date(s.date);
        return (
          d.getFullYear() === day.getFullYear() &&
          d.getMonth() === day.getMonth() &&
          d.getDate() === day.getDate()
        );
      })
      .reduce((sum, s) => sum + s.minutes, 0);
    byDayMinutes.push({ label, minutes });
  }

  res.json({
    totalTasks: tasks.length,
    byStatus,
    byPriority,
    bySubjectTasks,
    bySubjectMinutes,
    byDayMinutes,
    progressPercentage:
      tasks.length === 0 ? 0 : Math.round((byStatus.completed / tasks.length) * 100),
  });
}

module.exports = { getStats };

