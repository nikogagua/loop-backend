const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

exports.requireVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email to do this" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
