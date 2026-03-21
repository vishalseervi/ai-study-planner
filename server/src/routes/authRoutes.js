const express = require("express");
const { body } = require("express-validator");
const asyncHandler = require("../utils/asyncHandler");
const authMiddleware = require("../middleware/authMiddleware");
const { signup, login, me } = require("../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  [body("name").notEmpty(), body("email").isEmail(), body("password").isLength({ min: 6 })],
  asyncHandler(signup)
);
router.post("/login", [body("email").isEmail(), body("password").notEmpty()], asyncHandler(login));
router.get("/me", authMiddleware, asyncHandler(me));

module.exports = router;

