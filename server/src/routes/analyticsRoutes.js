const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { teacherClassAnalytics } = require("../controllers/analyticsController");

const router = express.Router();
router.use(authMiddleware);
router.get("/class", asyncHandler(teacherClassAnalytics));

module.exports = router;
