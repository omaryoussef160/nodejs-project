const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

exports.registerSchema = Joi.object({
  username: Joi.string().min(2).max(64).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.createUserSchema = Joi.object({
  username: Joi.string().min(2).max(64).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("user", "admin", "super-admin").default("user"),
});

exports.updateUserSchema = Joi.object({
  username: Joi.string().min(2).max(64),
  email: Joi.string().email(),
  password: Joi.string().min(8).max(128),
  role: Joi.string().valid("user", "admin", "super-admin"),
}).min(1);

exports.createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  group: Joi.alternatives()
    .try(objectId, Joi.string().valid(""), Joi.valid(null))
    .optional(),
}).unknown(false);

exports.updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().min(1),
  images: Joi.array().items(Joi.string().uri()).min(1),
  group: Joi.alternatives()
    .try(objectId, Joi.string().valid(""), Joi.valid(null))
    .optional(),
});

exports.createGroupSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
});

exports.addMemberSchema = Joi.object({
  userId: objectId.required(),
  canPost: Joi.boolean().default(false),
});

exports.permissionSchema = Joi.object({
  userId: objectId.required(),
  canPost: Joi.boolean().required(),
});

exports.addAdminSchema = Joi.object({
  userId: objectId.required(),
});

exports.updateGroupSchema = Joi.object({
  name: Joi.string().min(1).max(120).required(),
});

exports.paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  q: Joi.string().allow("", null),
});

exports.idParamSchema = Joi.object({
  id: objectId.required(),
});

exports.userIdParamSchema = Joi.object({
  userId: objectId.required(),
});

exports.groupMemberParamsSchema = Joi.object({
  id: objectId.required(),
  userId: objectId.required(),
});

exports.postIdParamSchema = Joi.object({
  postId: objectId.required(),
});

exports.commentParamsSchema = Joi.object({
  postId: objectId.required(),
  commentId: objectId.required(),
});

exports.createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});
