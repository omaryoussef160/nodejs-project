require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET missing in .env");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });

  } catch (error) {
    console.log("Error starting server:", error.message);
    process.exit(1);
  }
};

startServer();