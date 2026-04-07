const Group = require("../models/Group");

function idEq(a, b) {
  const ax = a && a._id ? a._id : a;
  const bx = b && b._id ? b._id : b;
  return String(ax) === String(bx);
}

function isGroupAdmin(userId, group) {
  return group.admins.some((a) => idEq(a, userId));
}

function isGroupMember(userId, group) {
  return isGroupAdmin(userId, group) || group.members.some((m) => idEq(m, userId));
}

function canPostInGroup(user, group) {
  if (user.role === "super-admin") return true;
  if (isGroupAdmin(user._id, group)) return true;
  const row = group.permissions.find((p) => idEq(p.user, user._id));
  return Boolean(row && row.canPost);
}

async function getAccessibleGroupIds(user) {
  if (user.role === "super-admin") {
    return null;
  }
  const groups = await Group.find({
    $or: [{ admins: user._id }, { members: user._id }],
  }).select("_id");
  return groups.map((g) => g._id);
}

module.exports = {
  isGroupAdmin,
  isGroupMember,
  canPostInGroup,
  getAccessibleGroupIds,
  idEq,
};
