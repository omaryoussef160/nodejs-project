const mongoose = require("mongoose");

let connecting;

async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGODB_URI (or MONGO_URL) is not set");
  }
  if (mongoose.connection.readyState === 1) return;
  if (connecting) return connecting;

  connecting = mongoose.connect(uri);
  await connecting;
  connecting = null;
}

module.exports = connectDB;
