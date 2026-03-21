const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { chat, suggestPlan } = require("../controllers/aiController");

const router = express.Router();
router.use(authMiddleware);
router.post("/chat", asyncHandler(chat));
router.get("/plan", asyncHandler(suggestPlan));

module.exports = router;

