const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { getStats } = require("../controllers/statsController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", asyncHandler(getStats));

module.exports = router;

