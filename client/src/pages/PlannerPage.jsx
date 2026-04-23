import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import api from "../api/client";
import usePortalData from "../hooks/usePortalData";

ChartJS.register(ArcElement, Tooltip, Legend);

function PlannerPage() {
  const { records, prediction, refresh } = usePortalData();
  const [form, setForm] = useState({
    subject: "Mathematics",
    weekStart: new Date().toISOString().slice(0, 10),
    studyHours: 8,
    sleepHours: 7,
    attendance: 85,
    previousScore: 68,
    subjectDifficulty: 3,
    assignmentCompletion: 80,
    score: 70,
  });

  async function submitRecord(event) {
    event.preventDefault();
    await api.post("/ml/records", form);
    refresh();
  }

  const avgAttendance = records.length
    ? records.reduce((sum, row) => sum + row.attendance, 0) / records.length
    : 0;
  const avgAssignments = records.length
    ? records.reduce((sum, row) => sum + row.assignmentCompletion, 0) / records.length
    : 0;

  const subjectImprovement = Object.entries(
    records.reduce((acc, row) => {
      if (!acc[row.subject]) acc[row.subject] = [];
      acc[row.subject].push(row.score);
      return acc;
    }, {})
  ).map(([subject, scores]) => ({
    subject,
    delta: scores.length > 1 ? scores[0] - scores[scores.length - 1] : 0,
  }));

  return (
    <div className="page">
      <h1>Adaptive Study Planner</h1>
      <div className="grid metrics-grid">
        <section className="card metric">
          <h3>Avg Attendance</h3>
          <strong className="big">{avgAttendance.toFixed(1)}%</strong>
        </section>
        <section className="card metric">
          <h3>Assignment Completion</h3>
          <strong className="big">{avgAssignments.toFixed(1)}%</strong>
        </section>
        <section className="card metric">
          <h3>Tracked Records</h3>
          <strong className="big">{records.length}</strong>
        </section>
      </div>
      <section className="card">
        <h3>Add Weekly Performance Record</h3>
        <form className="grid-form" onSubmit={submitRecord}>
          <input value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} />
          <input type="date" value={form.weekStart} onChange={(e) => setForm((s) => ({ ...s, weekStart: e.target.value }))} />
          <input type="number" value={form.studyHours} onChange={(e) => setForm((s) => ({ ...s, studyHours: Number(e.target.value) }))} placeholder="Study Hours" />
          <input type="number" value={form.sleepHours} onChange={(e) => setForm((s) => ({ ...s, sleepHours: Number(e.target.value) }))} placeholder="Sleep Hours" />
          <input type="number" value={form.attendance} onChange={(e) => setForm((s) => ({ ...s, attendance: Number(e.target.value) }))} placeholder="Attendance %" />
          <input type="number" value={form.previousScore} onChange={(e) => setForm((s) => ({ ...s, previousScore: Number(e.target.value) }))} placeholder="Previous Score" />
          <input type="number" value={form.subjectDifficulty} onChange={(e) => setForm((s) => ({ ...s, subjectDifficulty: Number(e.target.value) }))} placeholder="Difficulty 1-5" />
          <input type="number" value={form.assignmentCompletion} onChange={(e) => setForm((s) => ({ ...s, assignmentCompletion: Number(e.target.value) }))} placeholder="Assignment %" />
          <input type="number" value={form.score} onChange={(e) => setForm((s) => ({ ...s, score: Number(e.target.value) }))} placeholder="Actual Score" />
          <button className="btn" type="submit">Save Record</button>
        </form>
      </section>
      <div className="grid">
        <section className="card span-2">
          <h3>Adaptive Subject Plan</h3>
          <div className="stack">
            {(prediction?.adaptivePlan?.subjectPlans || []).map((item) => (
              <div key={item.subject} className="list-item">
                <span>{item.subject}</span>
                <small>
                  Pred: {item.predictedScore} | Target: {item.targetScore} | Hours: {item.suggestedWeeklyHours}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Consistency Indicators</h3>
          <Doughnut
            data={{
              labels: ["Attendance", "Assignments"],
              datasets: [
                {
                  data: [avgAttendance.toFixed(1), avgAssignments.toFixed(1)],
                  backgroundColor: ["#5865f2", "#22c55e"],
                },
              ],
            }}
          />
        </section>
        <section className="card">
          <h3>Feedback Loop (Improvement)</h3>
          <div className="stack">
            {subjectImprovement.map((item) => (
              <div key={item.subject} className="list-item">
                <span>{item.subject}</span>
                <small className={item.delta >= 0 ? "good-pill" : "risk-pill"}>
                  {item.delta >= 0 ? "+" : ""}
                  {item.delta.toFixed(1)}
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="card span-2">
          <h3>Recent Performance Records</h3>
          <div className="stack">
            {records.slice(0, 8).map((record) => (
              <div key={record._id} className="list-item">
                <span>{record.subject}</span>
                <small>Actual: {record.score} | Predicted: {record.predictedScore || "-"}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PlannerPage;
