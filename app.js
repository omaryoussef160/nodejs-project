require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const groupRoutes = require("./routes/groupRoutes");
const { globalErrorHandler, notFound } = require("./middleware/errorHandler");

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "12kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT_MAX) || 500,
});

app.get("/", (req, res) => {
  res.json({ status: "success", message: "Blog API is running" });
});

app.use("/auth", authLimiter, authRoutes);
app.use(apiLimiter);

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/groups", groupRoutes);

app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
