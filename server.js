require("dotenv").config();
const app = require("./src/app");
const connectDb = require("./src/config/db");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Failed to start server ❌", err);
  }
};

startServer();
