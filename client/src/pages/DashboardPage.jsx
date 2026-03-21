import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";
import useDashboardData from "../hooks/useDashboardData";

function DashboardPage() {
  const { user } = useAuth();
  const { tasks, stats, error } = useDashboardData();
  const upcoming = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5);

  return (
    <div className="page">
      <h1>Welcome, {user?.name}</h1>
      <p>{user?.course} - {user?.university}</p>
      {!!error && <p className="status error">{error}</p>}

      <div className="grid">
        <section className="card">
          <h3>Total Tasks</h3>
          <strong className="big">{stats?.totalTasks || 0}</strong>
        </section>
        <section className="card">
          <h3>Progress</h3>
          <strong className="big">{stats?.progressPercentage || 0}%</strong>
        </section>
        <section className="card">
          <h3>Completed</h3>
          <strong className="big">{stats?.byStatus?.completed || 0}</strong>
        </section>
      </div>

      <section className="card">
        <h3>Upcoming deadlines</h3>
        <div className="stack">
          {upcoming.map((task) => (
            <div className="list-item" key={task._id}>
              <span>{task.title}</span>
              <small>{dayjs(task.dueDate).format("DD MMM YYYY")}</small>
            </div>
          ))}
          {upcoming.length === 0 && <p>No tasks yet.</p>}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;

