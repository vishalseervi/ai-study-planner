import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/client";
import useDashboardData from "../hooks/useDashboardData";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

const STATUS_COLORS = {
  pending: "#ef4444",
  in_progress: "#f59e0b",
  completed: "#22c55e",
};

function ChartsPage() {
  const { stats, sessions, refresh } = useDashboardData();
  const [form, setForm] = useState({
    subject: "",
    date: "",
    minutes: 60,
    notes: "",
  });

  async function addSession(e) {
    e.preventDefault();
    await api.post("/sessions", form);
    setForm({ subject: "", date: "", minutes: 60, notes: "" });
    refresh();
  }

  async function deleteSession(id) {
    await api.delete(`/sessions/${id}`);
    refresh();
  }

  const charts = useMemo(() => {
    if (!stats) return null;

    return {
      completion: {
        labels: ["Pending", "In Progress", "Completed"],
        datasets: [
          {
            data: [
              stats.byStatus.pending,
              stats.byStatus.in_progress,
              stats.byStatus.completed,
            ],
            backgroundColor: [
              STATUS_COLORS.pending,
              STATUS_COLORS.in_progress,
              STATUS_COLORS.completed,
            ],
            hoverBackgroundColor: ["#dc2626", "#d97706", "#16a34a"],
            borderWidth: 1,
          },
        ],
      },

      subjects: {
        labels: Object.keys(stats.bySubjectMinutes || {}),
        datasets: [
          {
            label: "Minutes",
            data: Object.values(stats.bySubjectMinutes || {}),
            backgroundColor: "#5865f2",
          },
        ],
      },

      trend: {
        labels: (stats.byDayMinutes || []).map((d) => d.label),
        datasets: [
          {
            label: "Study minutes/day",
            data: (stats.byDayMinutes || []).map((d) => d.minutes),
            borderColor: "#5865f2",
            tension: 0.4, // smooth curve
          },
        ],
      },
    };
  }, [stats]);

  // 🔥 Animation options
  const commonOptions = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const doughnutOptions = {
    ...commonOptions,
    cutout: "60%",
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  };

  const barOptions = {
    ...commonOptions,
    animation: {
      duration: 1000,
    },
  };

  const lineOptions = {
    ...commonOptions,
    animation: {
      duration: 1200,
    },
  };

  return (
    <div className="page">
      <h1>Charts & Progress</h1>

      <div className="grid">
        <section className="card">
          {charts && (
            <Doughnut data={charts.completion} options={doughnutOptions} />
          )}
        </section>

        <section className="card">
          {charts && <Bar data={charts.subjects} options={barOptions} />}
        </section>

        <section className="card">
          {charts && <Line data={charts.trend} options={lineOptions} />}
        </section>

        <section className="card">
          <h3>Add Study Session</h3>

          <form className="stack" onSubmit={addSession}>
            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) =>
                setForm((s) => ({ ...s, subject: e.target.value }))
              }
              required
            />

            <div className="row">
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((s) => ({ ...s, date: e.target.value }))
                }
                required
              />

              <input
                type="number"
                value={form.minutes}
                onChange={(e) =>
                  setForm((s) => ({ ...s, minutes: Number(e.target.value) }))
                }
                min="1"
              />
            </div>

            <input
              placeholder="Notes"
              value={form.notes}
              onChange={(e) =>
                setForm((s) => ({ ...s, notes: e.target.value }))
              }
            />

            <button className="btn" type="submit">
              Save session
            </button>
          </form>

          <div className="stack">
            {sessions.slice(0, 6).map((session) => (
              <div key={session._id} className="list-item">
                <span>
                  {session.subject} - {session.minutes}m
                </span>
                <button
                  className="btn ghost small"
                  onClick={() => deleteSession(session._id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ChartsPage;
