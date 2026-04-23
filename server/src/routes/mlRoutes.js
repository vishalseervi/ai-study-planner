const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const {
  seedSampleDataset,
  clearSampleDataset,
  createPerformanceRecord,
  createPerformanceRecordForStudent,
  getMyPerformance,
  getPrediction,
} = require("../controllers/mlController");

const router = express.Router();
router.use(authMiddleware);

router.post("/seed-sample", asyncHandler(seedSampleDataset));
router.post("/clear-sample", asyncHandler(clearSampleDataset));
router.post("/records", asyncHandler(createPerformanceRecord));
router.post("/records/teacher", asyncHandler(createPerformanceRecordForStudent));
router.get("/records", asyncHandler(getMyPerformance));
router.get("/predict", asyncHandler(getPrediction));

module.exports = router;
