import { useCallback, useEffect, useState } from "react";
import api from "../api/client";

export default function useDashboardData() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");
      const [tasksRes, statsRes, sessionsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/stats"),
        api.get("/sessions"),
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
      setSessions(sessionsRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tasks, stats, sessions, error, refresh };
}

