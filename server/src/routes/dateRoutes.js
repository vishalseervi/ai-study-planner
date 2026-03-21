const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { getDates, createDate, deleteDate } = require("../controllers/dateController");

const router = express.Router();
router.use(authMiddleware);
router.get("/", asyncHandler(getDates));
router.post("/", asyncHandler(createDate));
router.delete("/:id", asyncHandler(deleteDate));

module.exports = router;

