const AppError = require("../utils/AppError");

// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  if (err.name === "CastError") {
    err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    err = new AppError(`Duplicate ${field}`, 400);
  }
  if (err.name === "ValidationError") {
    const msgs = Object.values(err.errors || {}).map((e) => e.message);
    err = new AppError(msgs.join(". ") || "Validation failed", 400);
  }
  if (err.name === "JsonWebTokenError") {
    err = new AppError("Invalid token", 401);
  }
  if (err.name === "TokenExpiredError") {
    err = new AppError("Token expired", 401);
  }

  res.status(err.statusCode).json({
    status: "error",
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
}

module.exports = { globalErrorHandler, notFound };
