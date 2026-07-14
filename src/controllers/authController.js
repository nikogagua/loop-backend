const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const validator = require("validator");

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

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
