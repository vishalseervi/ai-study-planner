const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const {
  chat,
  chatStream,
  createChatJob,
  getChatJob,
  getChatJobsByIds,
  getRecentChatJobs,
  suggestPlan,
} = require("../controllers/aiController");

const router = express.Router();
router.use(authMiddleware);
router.post("/chat", asyncHandler(chat));
router.post("/chat/stream", chatStream);
router.post("/jobs", asyncHandler(createChatJob));
router.get("/jobs/recent", asyncHandler(getRecentChatJobs));
router.get("/jobs/status", asyncHandler(getChatJobsByIds));
router.get("/jobs/:id", asyncHandler(getChatJob));
router.get("/plan", asyncHandler(suggestPlan));

module.exports = router;

