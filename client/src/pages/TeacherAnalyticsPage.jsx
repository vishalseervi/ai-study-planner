import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import usePortalData from "../hooks/usePortalData";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function TeacherAnalyticsPage() {
  const { analytics } = usePortalData();

  const trendData = {
    labels: (analytics?.subjectTrends || []).map((item) => item.subject),
    datasets: [
      {
        label: "Average Score",
        data: (analytics?.subjectTrends || []).map((item) => item.avgScore),
        backgroundColor: "#5865f2",
      },
    ],
  };

  const weakData = {
    labels: ["Weak Students", "Others"],
    datasets: [
      {
        data: [
          analytics?.weakStudents?.length || 0,
          Math.max((analytics?.totalStudents || 0) - (analytics?.weakStudents?.length || 0), 0),
        ],
        backgroundColor: ["#ef4444", "#22c55e"],
      },
    ],
  };

  const riskData = {
    labels: ["At Risk (<60)", "Stable (60-80)", "High Performers (>80)"],
    datasets: [
      {
        data: [
          (analytics?.studentComparison || []).filter((row) => row.latestScore < 60).length,
          (analytics?.studentComparison || []).filter(
            (row) => row.latestScore >= 60 && row.latestScore <= 80
          ).length,
          (analytics?.studentComparison || []).filter((row) => row.latestScore > 80).length,
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
      },
    ],
  };

  return (
    <div className="page">
      <h1>Class Analytics Dashboard</h1>
      <div className="grid metrics-grid">
        <section className="card metric">
          <h3>Class Avg</h3>
          <strong className="big">{analytics?.averageClassPerformance || 0}</strong>
        </section>
        <section className="card metric">
          <h3>Total Students</h3>
          <strong className="big">{analytics?.totalStudents || 0}</strong>
        </section>
        <section className="card metric">
          <h3>Weak Students</h3>
          <strong className="big">{analytics?.weakStudents?.length || 0}</strong>
        </section>
      </div>
      <div className="grid">
        <section className="card span-2">{analytics && <Bar data={trendData} />}</section>
        <section className="card">{analytics && <Doughnut data={weakData} />}</section>
        <section className="card">{analytics && <Doughnut data={riskData} />}</section>
        <section className="card span-2">
          <h3>Performance Snapshot</h3>
          <div className="stack">
            {(analytics?.studentComparison || []).slice(0, 8).map((student) => (
              <div className="list-item" key={student.studentId}>
                <span>{student.name}</span>
                <small>
                  Actual {student.latestScore} | Pred {student.latestPredictedScore?.toFixed?.(1) || 0}
                </small>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="card">
        <h3>Weak Students List</h3>
        <div className="stack">
          {(analytics?.weakStudents || []).map((student) => (
            <div className="list-item" key={student.studentId}>
              <span>{student.name}</span>
              <small>{student.averageScore}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default TeacherAnalyticsPage;
