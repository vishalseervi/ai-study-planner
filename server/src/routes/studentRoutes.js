const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { listStudents, getStudentSnapshot } = require("../controllers/studentController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", asyncHandler(listStudents));
router.get("/:id", asyncHandler(getStudentSnapshot));

module.exports = router;
