import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const blankForm = {
  title: "",
  description: "",
  subject: "",
  dueDate: "",
  priority: "medium",
  status: "pending",
};

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [sortBy, setSortBy] = useState("dueDate");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      const q = filterStatus === "all" ? "" : `?status=${filterStatus}&sort=${sortBy}`;
      const res = await api.get(`/tasks${q}`);
      setTasks(res.data);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load tasks");
    }
  }

  useEffect(() => {
    loadTasks();
  }, [sortBy, filterStatus]);

  async function createTask(e) {
    e.preventDefault();
    await api.post("/tasks", form);
    setForm(blankForm);
    loadTasks();
  }

  async function deleteTask(id) {
    await api.delete(`/tasks/${id}`);
    loadTasks();
  }

  async function updateTask(id, patch) {
    await api.patch(`/tasks/${id}`, patch);
    loadTasks();
  }

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [tasks]
  );

  return (
    <div className="page">
      <h1>Tasks</h1>
      {!!error && <p className="status error">{error}</p>}
      <div className="grid">
        <section className="card">
          <h3>Add Task</h3>
          <form className="stack" onSubmit={createTask}>
            <input placeholder="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
            <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} required />
            <input type="date" value={form.dueDate} onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))} required />
            <div className="row">
              <select value={form.priority} onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
              <select value={form.status} onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}>
                <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
              </select>
            </div>
            <button className="btn" type="submit">Add task</button>
          </form>
        </section>

        <section className="card">
          <div className="row between">
            <h3>Task List</h3>
            <div className="row">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
          <div className="stack tasks">
            {sortedTasks.map((task) => (
              <article key={task._id} className="task-item">
                <div className="row between">
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.subject} • {task.priority}</p>
                  </div>
                  <button className="btn danger small" onClick={() => deleteTask(task._id)}>Delete</button>
                </div>
                <p>{task.description}</p>
                <div className="row">
                  <small>Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                  <select value={task.status} onChange={(e) => updateTask(task._id, { status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </article>
            ))}
            {sortedTasks.length === 0 && <p>No tasks found.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default TasksPage;

