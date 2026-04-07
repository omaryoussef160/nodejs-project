const Post = require("../models/Post");
const Group = require("../models/Group");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { getAccessibleGroupIds, canPostInGroup, isGroupMember } = require("../utils/groupAccess");

function canModifyPost(user, post) {
  if (user.role === "super-admin") return true;
  return String(post.author) === String(user._id);
}

exports.getAllPosts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const q = (req.query.q || "").trim();

  let filter = {};

  if (req.user.role === "super-admin") {
    filter = {};
  } else {
    const groupIds = await getAccessibleGroupIds(req.user);
    filter = {
      $or: [{ group: null }, { group: { $in: groupIds } }],
    };
  }

  const textFilter = q
    ? {
        $text: { $search: q },
      }
    : null;

  const finalFilter = textFilter ? { $and: [filter, textFilter] } : filter;

  const [posts, total] = await Promise.all([
    Post.find(finalFilter)
      .populate("author", "username email role")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(finalFilter),
  ]);

  res.json({
    status: "success",
    results: posts.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: posts,
  });
});

exports.getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username email role")
    .populate("group", "name");
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (req.user.role === "super-admin") {
    return res.json({ status: "success", data: post });
  }

  if (!post.group) {
    return res.json({ status: "success", data: post });
  }

  const group = await Group.findById(post.group);
  if (!group) {
    throw new AppError("Post group not found", 404);
  }
  if (!isGroupMember(req.user._id, group)) {
    throw new AppError("You do not have access to this post", 403);
  }

  res.json({ status: "success", data: post });
});

exports.getMyPosts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;

  const filter = { author: req.user._id };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    results: posts.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: posts,
  });
});

exports.getUserPosts = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const skip = (page - 1) * limit;
  const userId = req.params.userId;

  const filter = { author: userId };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate("author", "username email role")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    results: posts.length,
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
    data: posts,
  });
});

exports.createPost = catchAsync(async (req, res) => {
  const { title, content } = req.body;
  let groupId = req.body.group || null;
  if (groupId === "") groupId = null;

  const images = req.imageUrls || [];
  if (!images.length) {
    throw new AppError("At least one image is required", 400);
  }

  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new AppError("Group not found", 404);
    }
    if (!isGroupMember(req.user._id, group)) {
      throw new AppError("You must be a member of this group to post", 403);
    }
    if (!canPostInGroup(req.user, group)) {
      throw new AppError("You do not have permission to post in this group", 403);
    }
  }

  const post = await Post.create({
    title,
    content,
    images,
    author: req.user._id,
    group: groupId,
  });

  const populated = await Post.findById(post._id)
    .populate("author", "username email role")
    .populate("group", "name");

  res.status(201).json({ status: "success", data: populated });
});

exports.updatePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (!canModifyPost(req.user, post)) {
    throw new AppError("You can only edit your own posts", 403);
  }

  const hasBodyField = ["title", "content", "images", "group"].some((k) => req.body[k] !== undefined);
  const hasFiles = req.files && req.files.length;
  if (!hasBodyField && !hasFiles) {
    throw new AppError("No updates provided", 400);
  }

  const { title, content, images: bodyImages, group: bodyGroup } = req.body;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;

  const uploaded = req.imageUrls || [];
  if (uploaded.length) {
    post.images = post.images.concat(uploaded);
  }
  if (bodyImages !== undefined) {
    if (!Array.isArray(bodyImages) || !bodyImages.length) {
      throw new AppError("images must be a non-empty array when provided", 400);
    }
    post.images = bodyImages;
  }

  if (post.images.length === 0) {
    throw new AppError("Post must keep at least one image", 400);
  }

  if (bodyGroup !== undefined) {
    let nextGroup = bodyGroup === "" || bodyGroup === null ? null : bodyGroup;
    if (nextGroup) {
      const group = await Group.findById(nextGroup);
      if (!group) {
        throw new AppError("Group not found", 404);
      }
      if (!isGroupMember(req.user._id, group)) {
        throw new AppError("You must be a member of the target group", 403);
      }
      if (!canPostInGroup(req.user, group)) {
        throw new AppError("You do not have permission to post in this group", 403);
      }
    }
    post.group = nextGroup;
  }

  await post.save();
  const populated = await Post.findById(post._id)
    .populate("author", "username email role")
    .populate("group", "name");

  res.json({ status: "success", data: populated });
});

exports.deletePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }
  if (!canModifyPost(req.user, post)) {
    throw new AppError("You can only delete your own posts", 403);
  }
  await Post.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

exports.toggleLike = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const uid = String(req.user._id);
  const idx = post.likes.findIndex((id) => String(id) === uid);
  if (idx >= 0) {
    post.likes.splice(idx, 1);
  } else {
    post.likes.push(req.user._id);
  }
  await post.save();
  res.json({ status: "success", likesCount: post.likes.length, liked: idx < 0 });
});
