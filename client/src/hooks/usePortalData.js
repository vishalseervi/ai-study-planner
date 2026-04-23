import { useCallback, useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function usePortalData() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      setError("");
      if (user.role === "teacher") {
        const [analyticsRes, studentsRes] = await Promise.all([
          api.get("/analytics/class"),
          api.get("/students"),
        ]);
        setAnalytics(analyticsRes.data);
        setStudents(studentsRes.data);
      } else {
        const [recordsRes, predictionRes] = await Promise.all([
          api.get("/ml/records"),
          api.get("/ml/predict"),
        ]);
        setRecords(recordsRes.data);
        setPrediction(predictionRes.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load portal data");
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { records, prediction, analytics, students, error, refresh };
}
