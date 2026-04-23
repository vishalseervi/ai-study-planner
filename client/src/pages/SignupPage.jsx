import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    className: "BCA-4A",
    studentId: "",
    course: "BCA General 4th Semester",
    university: "Presidency University, Bangalore",
  });
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup failed");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create account</h1>
        {!!error && <p className="status error">{error}</p>}
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
          required
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          required
        />
        <input
          placeholder="Password (min 6 chars)"
          type="password"
          value={form.password}
          onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          required
        />
        <select value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <input
          placeholder="Class (e.g. BCA-4A)"
          value={form.className}
          onChange={(e) => setForm((s) => ({ ...s, className: e.target.value }))}
          required
        />
        {form.role === "student" && (
          <input
            placeholder="Student ID"
            value={form.studentId}
            onChange={(e) => setForm((s) => ({ ...s, studentId: e.target.value }))}
          />
        )}
        <button className="btn" type="submit">
          Signup
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;

