import { useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function SettingsPage() {
  const { user, setUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || "",
    university: user?.university || "",
    course: user?.course || "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function saveProfile(e) {
    e.preventDefault();
    try {
      const res = await api.patch("/settings/profile", form);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setMessage("Profile updated.");
      setError("");
    } catch (e2) {
      setError(e2?.response?.data?.message || "Update failed");
      setMessage("");
    }
  }

  async function resetAll() {
    const ok = window.confirm("Delete all tasks, sessions and dates?");
    if (!ok) return;
    await api.delete("/settings/reset-data");
    setMessage("All study data reset.");
  }

  return (
    <div className="page">
      <h1>Settings</h1>
      {!!error && <p className="status error">{error}</p>}
      {!!message && <p className="status success">{message}</p>}
      <section className="card">
        <h3>Profile</h3>
        <form className="stack" onSubmit={saveProfile}>
          <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          <input value={form.university} onChange={(e) => setForm((s) => ({ ...s, university: e.target.value }))} />
          <input value={form.course} onChange={(e) => setForm((s) => ({ ...s, course: e.target.value }))} />
          <input type="password" placeholder="New password (optional)" value={form.password} onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))} />
          <button className="btn" type="submit">Save Profile</button>
        </form>
      </section>
      <section className="card">
        <h3>Theme</h3>
        <button className="btn ghost" onClick={toggleTheme}>Current: {theme}</button>
      </section>
      <section className="card">
        <h3>Danger Zone</h3>
        <button className="btn danger" onClick={resetAll}>Reset All Tasks/Data</button>
      </section>
    </div>
  );
}

export default SettingsPage;

