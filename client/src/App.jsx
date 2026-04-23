import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import AiCoachPage from "./pages/AiCoachPage";
import PlannerPage from "./pages/PlannerPage";
import TeacherAnalyticsPage from "./pages/TeacherAnalyticsPage";
import StudentsPage from "./pages/StudentsPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="teacher-analytics" element={<TeacherAnalyticsPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="ai" element={<AiCoachPage />} />
      </Route>
    </Routes>
  );
}

export default App;
