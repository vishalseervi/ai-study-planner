import { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../api/client";
import usePortalData from "../hooks/usePortalData";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function StudentsPage() {
  const { students } = usePortalData();
  const [snapshot, setSnapshot] = useState(null);
  const [query, setQuery] = useState("");
  const [recordForm, setRecordForm] = useState({
    subject: "Mathematics",
    weekStart: new Date().toISOString().slice(0, 10),
    studyHours: 8,
    sleepHours: 7,
    attendance: 85,
    previousScore: 65,
    subjectDifficulty: 3,
    assignmentCompletion: 80,
    score: 70,
  });

  async function loadStudent(id) {
    const response = await api.get(`/students/${id}`);
    setSnapshot(response.data);
  }

  async function addManualRecord(event) {
    event.preventDefault();
    if (!snapshot?.student?._id) return;
    await api.post("/ml/records/teacher", {
      studentId: snapshot.student._id,
      ...recordForm,
    });
    await loadStudent(snapshot.student._id);
  }

  const filtered = students.filter((student) =>
    `${student.name} ${student.studentId}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="page">
      <h1>Student Comparison</h1>
      <div className="grid">
        <section className="card">
          <h3>Class Students</h3>
          <input
            placeholder="Search by name or student id"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="stack">
            {filtered.map((student) => (
              <button className="list-item btn ghost" type="button" key={student._id} onClick={() => loadStudent(student._id)}>
                <span>{student.name}</span>
                <small>{student.studentId}</small>
              </button>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>Selected Student Profile</h3>
          {!snapshot && <p>Select a student to view performance history and adaptive plan.</p>}
          {snapshot && (
            <>
              <p>{snapshot.student.name} - {snapshot.student.studentId}</p>
              <p>{snapshot.plan?.recommendation || "No generated plan."}</p>
              <h4>Add Manual Performance Entry</h4>
              <form className="grid-form" onSubmit={addManualRecord}>
                <input
                  value={recordForm.subject}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, subject: event.target.value }))
                  }
                />
                <input
                  type="date"
                  value={recordForm.weekStart}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, weekStart: event.target.value }))
                  }
                />
                <input
                  type="number"
                  value={recordForm.studyHours}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, studyHours: Number(event.target.value) }))
                  }
                  placeholder="Study Hours"
                />
                <input
                  type="number"
                  value={recordForm.sleepHours}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, sleepHours: Number(event.target.value) }))
                  }
                  placeholder="Sleep Hours"
                />
                <input
                  type="number"
                  value={recordForm.attendance}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, attendance: Number(event.target.value) }))
                  }
                  placeholder="Attendance %"
                />
                <input
                  type="number"
                  value={recordForm.previousScore}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, previousScore: Number(event.target.value) }))
                  }
                  placeholder="Previous Score"
                />
                <input
                  type="number"
                  value={recordForm.subjectDifficulty}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, subjectDifficulty: Number(event.target.value) }))
                  }
                  placeholder="Difficulty 1-5"
                />
                <input
                  type="number"
                  value={recordForm.assignmentCompletion}
                  onChange={(event) =>
                    setRecordForm((state) => ({
                      ...state,
                      assignmentCompletion: Number(event.target.value),
                    }))
                  }
                  placeholder="Assignment %"
                />
                <input
                  type="number"
                  value={recordForm.score}
                  onChange={(event) =>
                    setRecordForm((state) => ({ ...state, score: Number(event.target.value) }))
                  }
                  placeholder="Actual Score"
                />
                <button className="btn" type="submit">
                  Add Manual Record
                </button>
              </form>
              <Line
                data={{
                  labels: (snapshot.records || []).slice(0, 6).map((record) => record.subject),
                  datasets: [
                    {
                      label: "Actual",
                      data: (snapshot.records || []).slice(0, 6).map((record) => record.score),
                      borderColor: "#5865f2",
                      tension: 0.3,
                    },
                    {
                      label: "Predicted",
                      data: (snapshot.records || []).slice(0, 6).map((record) => record.predictedScore || record.score),
                      borderColor: "#22c55e",
                      tension: 0.3,
                    },
                  ],
                }}
              />
              <div className="stack">
                {(snapshot.records || []).slice(0, 6).map((record) => (
                  <div className="list-item" key={record._id}>
                    <span>{record.subject}</span>
                    <small>{record.score} / Pred {record.predictedScore || "-"}</small>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default StudentsPage;
