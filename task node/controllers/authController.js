const User = require("../models/User");
const AppError = require("../utils/AppError");
const { signToken } = require("../middleware/auth");

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: "error", message: "Email already registered" });
    }
    const user = await User.create({ username, email, password, role: "user" });
    const token = signToken(user._id);
    res.status(201).json({ status: "success", token, user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ status: "error", message: "Invalid email or password" });
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ status: "success", token, user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};