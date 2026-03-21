import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/tasks", label: "Tasks" },
  { to: "/charts", label: "Charts" },
  { to: "/ai", label: "AI Coach" },
  { to: "/settings", label: "Settings" },
];

function Layout() {
  const { toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="logo">StudyFlow</h2>
        <button className="btn" onClick={toggleTheme}>
          {theme === "light" ? "Dark mode" : "Light mode"}
        </button>
        <nav className="nav-list">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="small-card">
          <p>{user?.name}</p>
          <small>{user?.course}</small>
          <button className="btn ghost" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>
      <main className="app">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

export default Layout;

