const Comment = require("../models/Comment");
const Post = require("../models/Post");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.listComments = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const filter = { post: post._id };
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments(filter),
  ]);

  res.json({
    status: "success",
    results: comments.length,
    total,
    page,
    data: comments,
  });
});

exports.createComment = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    content: req.body.content,
  });

  const populated = await Comment.findById(comment._id).populate("author", "username email");
  res.status(201).json({ status: "success", data: populated });
});

exports.deleteComment = catchAsync(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  if (
    req.user.role !== "super-admin" &&
    String(comment.author) !== String(req.user._id)
  ) {
    throw new AppError("You can only delete your own comment", 403);
  }

  await Comment.findByIdAndDelete(comment._id);
  res.status(204).send();
});
