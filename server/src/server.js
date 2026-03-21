require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dateRoutes = require("./routes/dateRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const statsRoutes = require("./routes/statsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_study_planner";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dates", dateRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/settings", settingsRoutes);

app.use(errorMiddleware);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Mongo connection failed:", err.message);
    process.exit(1);
  });
