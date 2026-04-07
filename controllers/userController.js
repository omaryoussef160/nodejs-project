const User = require("../models/User");
const Post = require("../models/Post");
const Group = require("../models/Group");
const Comment = require("../models/Comment");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

function canViewUser(requester, targetId) {
  if (requester.role === "super-admin" || requester.role === "admin") return true;
  return String(requester._id) === String(targetId);
}

exports.getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ status: "success", data: user });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ status: "success", results: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  if (!canViewUser(req.user, user._id)) {
    throw new AppError("You do not have permission to view this user", 403);
  }
  res.json({ status: "success", data: user });
});

exports.createUser = catchAsync(async (req, res) => {
  const { username, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 400);
  }
  let finalRole = role || "user";
  if (req.user.role !== "super-admin") {
    if (finalRole !== "user") {
      throw new AppError("Only super-admin can assign admin roles", 403);
    }
  }
  if (finalRole === "super-admin" && req.user.role !== "super-admin") {
    throw new AppError("Only a super-admin can create super-admin users", 403);
  }
  const user = await User.create({ username, email, password, role: finalRole });
  res.status(201).json({ status: "success", data: user });
});

exports.updateUser = catchAsync(async (req, res) => {
  const target = await User.findById(req.params.id).select("+password");
  if (!target) {
    throw new AppError("User not found", 404);
  }

  const isSelf = String(req.user._id) === String(target._id);
  const isSuper = req.user.role === "super-admin";
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isSuper && !isAdmin) {
    throw new AppError("You do not have permission to update this user", 403);
  }
  if ((isAdmin && !isSuper) && target.role === "super-admin") {
    throw new AppError("You cannot modify a super-admin", 403);
  }
  if (req.body.role && req.user.role !== "super-admin") {
    throw new AppError("Only super-admin can change roles", 403);
  }
  if (req.body.role === "super-admin" && req.user.role !== "super-admin") {
    throw new AppError("Only super-admin can assign super-admin", 403);
  }

  const { username, email, password, role } = req.body;
  if (username !== undefined) target.username = username;
  if (email !== undefined) target.email = email;
  if (password !== undefined) target.password = password;
  if (role !== undefined && isSuper) target.role = role;

  await target.save();
  target.password = undefined;
  res.json({ status: "success", data: target });
});

exports.deleteUser = catchAsync(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  const isSelf = String(req.user._id) === String(target._id);
  const isSuper = req.user.role === "super-admin";

  if (!isSelf && !isSuper) {
    throw new AppError("You do not have permission to delete this user", 403);
  }
  if (target.role === "super-admin" && !isSuper) {
    throw new AppError("You cannot delete a super-admin", 403);
  }

  await Post.deleteMany({ author: target._id });
  await Comment.deleteMany({ author: target._id });
  await Group.updateMany({}, { $pull: { admins: target._id, members: target._id } });
  await Group.updateMany({}, { $pull: { permissions: { user: target._id } } });

  await User.findByIdAndDelete(target._id);
  res.status(204).send();
});
