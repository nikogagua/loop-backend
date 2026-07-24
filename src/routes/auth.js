const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, adminOnly } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/resend-verification",
  authenticate,
  authController.resendVerification,
);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
