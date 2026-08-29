const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validator = require("validator");
const crypto = require("crypto");

const sendEmail = require("../config/email");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (cleanName.length < 3 || cleanName.length > 20) {
      return res
        .status(400)
        .json({ message: "Username must be 3-20 characters" });
    }

    if (!validator.isEmail(cleanEmail)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Loop account",
      html: `<p>Click to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const cleanEmail = email.trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isPasswordMaching = await bcrypt.compare(password, user.password);
    if (!isPasswordMaching) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      isVerified: user.isVerified,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.BACKEND_URL}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify your Loop account",
      html: `<p>Click to verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    res.status(200).json({ message: "Verification email resent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const token = req.params.token;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link" });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Verification link has expired" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return res.status(400).json({ message: "Enter email" });
    }

    const cleanEmail = email.trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent",
      });
    }
    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.BACKEND_URL}/api/auth/reset-password/${passwordResetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Update Password",
      html: `<p>Click to verify your email: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    res.status(200).json({
      message: "If that email is registered, a reset link has been sent",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const password = req.body.password;

    if (!password) {
      return res.status(400).json({ message: "Enter a new password" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    if (!/\d/.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must contain at least one number" });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        message: "Password must contain at least one uppercase letter",
      });
    }

    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    if (user.passwordResetTokenExpires < Date.now()) {
      return res.status(400).json({ message: "Reset link has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
