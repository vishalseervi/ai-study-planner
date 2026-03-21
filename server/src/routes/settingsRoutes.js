const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { updateProfile, resetAllTasks } = require("../controllers/settingsController");

const router = express.Router();

router.use(authMiddleware);

router.patch("/profile", asyncHandler(updateProfile));
router.delete("/reset-data", asyncHandler(resetAllTasks));

module.exports = router;