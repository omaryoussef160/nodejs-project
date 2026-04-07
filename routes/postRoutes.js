const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { upload, uploadOnImageKit } = require("../middleware/uploadOnImageKit");
const {
  createPostSchema,
  idParamSchema,
  userIdParamSchema,
  paginationQuerySchema,
  postIdParamSchema,
  commentParamsSchema,
  createCommentSchema,
} = require("../validations/schemas");
const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

const router = express.Router();

const requiredImages = [upload.array("images", 10), uploadOnImageKit({ required: true })];
const optionalImages = [upload.array("images", 10), uploadOnImageKit({ required: false })];

router.get(
  "/",
  protect,
  validate(paginationQuerySchema, "query"),
  postController.getAllPosts
);
router.get("/me", protect, validate(paginationQuerySchema, "query"), postController.getMyPosts);
router.get(
  "/user/:userId",
  protect,
  validate(userIdParamSchema, "params"),
  validate(paginationQuerySchema, "query"),
  postController.getUserPosts
);

router.get(
  "/:postId/comments",
  validate(postIdParamSchema, "params"),
  validate(paginationQuerySchema, "query"),
  commentController.listComments
);
router.post(
  "/:postId/comments",
  protect,
  validate(postIdParamSchema, "params"),
  validate(createCommentSchema),
  commentController.createComment
);
router.delete(
  "/:postId/comments/:commentId",
  protect,
  validate(commentParamsSchema, "params"),
  commentController.deleteComment
);

router.post(
  "/",
  protect,
  ...requiredImages,
  validate(createPostSchema),
  postController.createPost
);

router.post("/:id/like", protect, validate(idParamSchema, "params"), postController.toggleLike);

const updatePostHandlers = [
  protect,
  validate(idParamSchema, "params"),
  ...optionalImages,
  postController.updatePost,
];
router.patch("/:id", ...updatePostHandlers);
router.put("/:id", ...updatePostHandlers);

router.delete("/:id", protect, validate(idParamSchema, "params"), postController.deletePost);

router.get("/:id", protect, validate(idParamSchema, "params"), postController.getPost);

module.exports = router;
