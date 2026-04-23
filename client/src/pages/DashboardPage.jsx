import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useAuth } from "../context/AuthContext";
import usePortalData from "../hooks/usePortalData";
import api from "../api/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

function DashboardPage() {
  const { user } = useAuth();
  const { prediction, analytics, records, error, refresh } = usePortalData();

  async function seedDataset() {
    await api.post("/ml/seed-sample");
    refresh();
  }

  async function clearDataset() {
    await api.post("/ml/clear-sample");
    refresh();
  }

  const recentRows = [...records].reverse().slice(0, 10);

  return (
    <div className="page">
      <section className="hero">
        <h1>{user?.role === "teacher" ? "Teacher Dashboard" : "Student Dashboard"}</h1>
        <p>{user?.course} - {user?.university}</p>
      </section>
      {!!error && <p className="status error">{error}</p>}

      {user?.role === "teacher" ? (
        <>
          <div className="grid metrics-grid">
            <section className="card metric">
              <h3>Class</h3>
              <strong className="big">{analytics?.className || "-"}</strong>
            </section>
            <section className="card metric">
              <h3>Students</h3>
              <strong className="big">{analytics?.totalStudents || 0}</strong>
            </section>
            <section className="card metric">
              <h3>Average Class Performance</h3>
              <strong className="big">{analytics?.averageClassPerformance || 0}</strong>
            </section>
          </div>
          <div className="grid">
            <section className="card span-2">
              <h3>Top Student Comparison</h3>
              <Bar
                data={{
                  labels: (analytics?.studentComparison || []).slice(0, 8).map((row) => row.name),
                  datasets: [
                    {
                      label: "Latest Actual",
                      data: (analytics?.studentComparison || []).slice(0, 8).map((row) => row.latestScore),
                      backgroundColor: "#5865f2",
                    },
                    {
                      label: "Latest Predicted",
                      data: (analytics?.studentComparison || []).slice(0, 8).map((row) => row.latestPredictedScore),
                      backgroundColor: "#22c55e",
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </section>
            <section className="card">
              <h3>Bootstrap Sample Dataset</h3>
              <p>Generate multi-student records for ML training and analytics in one click.</p>
              <div className="row gap-sm">
                <button className="btn" onClick={seedDataset} type="button">
                  Seed Dataset
                </button>
                <button className="btn ghost danger-outline" onClick={clearDataset} type="button">
                  Clear Dataset
                </button>
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="grid metrics-grid">
            <section className="card metric">
              <h3>Training Samples</h3>
              <strong className="big">{prediction?.modelMetrics?.samples ?? "-"}</strong>
            </section>
            <section className="card metric">
              <h3>Model MAE</h3>
              <strong className="big">{prediction?.modelMetrics?.mae ?? "-"}</strong>
            </section>
            <section className="card metric">
              <h3>Model R2</h3>
              <strong className="big">{prediction?.modelMetrics?.r2 ?? "-"}</strong>
            </section>
            <section className="card metric">
              <h3>Plan Confidence</h3>
              <strong className="big">{prediction?.adaptivePlan?.confidenceBand || "-"}</strong>
            </section>
          </div>
          <div className="grid">
            <section className="card span-2">
              <h3>Predicted Subject Scores</h3>
              <Bar
                data={{
                  labels: Object.keys(prediction?.predictions || {}),
                  datasets: [
                    {
                      label: "Predicted Score",
                      data: Object.values(prediction?.predictions || {}),
                      backgroundColor: "#5865f2",
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </section>
            <section className="card">
              <h3>Adaptive Recommendation</h3>
              <p>{prediction?.adaptivePlan?.recommendation || "Add records to generate recommendations."}</p>
            </section>
            <section className="card span-2">
              <h3>Feedback Loop: Actual vs Predicted Trend</h3>
              <Line
                data={{
                  labels: recentRows.map((row) => row.subject),
                  datasets: [
                    {
                      label: "Actual",
                      data: recentRows.map((row) => row.score),
                      borderColor: "#22c55e",
                      tension: 0.35,
                    },
                    {
                      label: "Predicted",
                      data: recentRows.map((row) => row.predictedScore || row.score),
                      borderColor: "#5865f2",
                      tension: 0.35,
                    },
                  ],
                }}
                options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
              />
            </section>
          </div>
        </>
      )}
      <section className="card">
        <h3>Project Scope</h3>
        <p>
          This portal uses supervised learning on study behavior signals to forecast performance and
          continuously update adaptive study plans at student and class level.
        </p>
      </section>
    </div>
  );
}

export default DashboardPage;

