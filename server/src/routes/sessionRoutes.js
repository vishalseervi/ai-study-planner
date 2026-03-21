const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { getSessions, createSession, deleteSession } = require("../controllers/sessionController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", asyncHandler(getSessions));
router.post("/", asyncHandler(createSession));
router.delete("/:id", asyncHandler(deleteSession));

module.exports = router;

