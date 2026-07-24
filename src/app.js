const express = require("express");
const cors = require("cors");

const app = express();
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);

app.get("/", (req, res) => {
  res.send("Loop Backend is running 🚀");
});

module.exports = app;
