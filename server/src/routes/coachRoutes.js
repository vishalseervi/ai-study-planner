const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { chatWithData } = require("../controllers/coachController");

const router = express.Router();
router.use(authMiddleware);
router.post("/chat", asyncHandler(chatWithData));

module.exports = router;
