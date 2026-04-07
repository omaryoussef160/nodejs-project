const Group = require("../models/Group");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { isGroupAdmin, isGroupMember, idEq } = require("../utils/groupAccess");

function assertManageGroup(user, group) {
  if (user.role === "super-admin") {
    return;
  }
  if (!isGroupAdmin(user._id, group)) {
    throw new AppError("Only group admins can perform this action", 403);
  }
}

exports.createGroup = catchAsync(async (req, res) => {
  const { name } = req.body;
  const group = await Group.create({
    name,
    admins: [req.user._id],
    members: [],
    permissions: [],
  });
  res.status(201).json({ status: "success", data: group });
});

exports.getAllGroups = catchAsync(async (req, res) => {
  let query = {};
  if (req.user.role !== "super-admin") {
    query = { $or: [{ admins: req.user._id }, { members: req.user._id }] };
  }
  const groups = await Group.find(query)
    .populate("admins", "username email")
    .populate("members", "username email")
    .populate("permissions.user", "username email")
    .sort({ createdAt: -1 });
  res.json({ status: "success", results: groups.length, data: groups });
});

exports.getGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate("admins", "username email role")
    .populate("members", "username email role")
    .populate("permissions.user", "username email role");
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  if (req.user.role === "super-admin" || isGroupMember(req.user._id, group)) {
    return res.json({ status: "success", data: group });
  }
  throw new AppError("You do not have access to this group", 403);
});

exports.updateGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);
  if (req.body.name) {
    group.name = req.body.name.trim();
  }
  await group.save();
  res.json({ status: "success", data: group });
});

exports.deleteGroup = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);

  const Post = require("../models/Post");
  await Post.updateMany({ group: group._id }, { $set: { group: null } });
  await Group.findByIdAndDelete(group._id);
  res.status(204).send();
});

exports.addMember = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);

  const { userId, canPost } = req.body;
  const target = await User.findById(userId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  if (group.admins.some((a) => idEq(a, userId))) {
    throw new AppError("User is already an admin", 400);
  }
  if (!group.members.some((m) => idEq(m, userId))) {
    group.members.push(userId);
  }

  const existingPerm = group.permissions.find((p) => idEq(p.user, userId));
  if (existingPerm) {
    existingPerm.canPost = Boolean(canPost);
  } else {
    group.permissions.push({ user: userId, canPost: Boolean(canPost) });
  }

  await group.save();
  const populated = await Group.findById(group._id)
    .populate("members", "username email")
    .populate("permissions.user", "username email");
  res.json({ status: "success", data: populated });
});

exports.removeMember = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);

  const { userId } = req.params;
  if (group.admins.some((a) => idEq(a, userId))) {
    throw new AppError("Remove admin role before removing this user", 400);
  }

  group.members = group.members.filter((m) => !idEq(m, userId));
  group.permissions = group.permissions.filter((p) => !idEq(p.user, userId));
  await group.save();

  res.json({ status: "success", data: group });
});

exports.addAdmin = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);

  const userId = req.body.userId;
  const target = await User.findById(userId);
  if (!target) {
    throw new AppError("User not found", 404);
  }

  if (!group.admins.some((a) => idEq(a, userId))) {
    group.admins.push(userId);
  }
  group.members = group.members.filter((m) => !idEq(m, userId));
  group.permissions = group.permissions.filter((p) => !idEq(p.user, userId));

  await group.save();
  const populated = await Group.findById(group._id)
    .populate("admins", "username email")
    .populate("members", "username email");
  res.json({ status: "success", data: populated });
});

exports.updatePermission = catchAsync(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    throw new AppError("Group not found", 404);
  }
  assertManageGroup(req.user, group);

  const { userId, canPost } = req.body;
  if (!group.members.some((m) => idEq(m, userId))) {
    throw new AppError("User is not a member of this group", 400);
  }

  let row = group.permissions.find((p) => idEq(p.user, userId));
  if (!row) {
    row = { user: userId, canPost: Boolean(canPost) };
    group.permissions.push(row);
  } else {
    row.canPost = Boolean(canPost);
  }

  await group.save();
  const populated = await Group.findById(group._id).populate("permissions.user", "username email");
  res.json({ status: "success", data: populated });
});
