const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/taskController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", asyncHandler(getTasks));
router.post(
  "/",
  [body("title").notEmpty(), body("subject").notEmpty(), body("dueDate").notEmpty()],
  asyncHandler(createTask)
);
router.patch("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));

module.exports = router;

