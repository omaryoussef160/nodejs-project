const express = require("express");
const { protect, restrictTo } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createUserSchema,
  updateUserSchema,
  idParamSchema,
} = require("../validations/schemas");
const userController = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/me", userController.getMe);
router.get("/", restrictTo("admin", "super-admin"), userController.getAllUsers);
router.post("/", restrictTo("admin", "super-admin"), validate(createUserSchema), userController.createUser);
router.get("/:id", validate(idParamSchema, "params"), userController.getUser);
const updateUserHandlers = [
  validate(idParamSchema, "params"),
  validate(updateUserSchema),
  userController.updateUser,
];
router.patch("/:id", ...updateUserHandlers);
router.put("/:id", ...updateUserHandlers);
router.delete("/:id", validate(idParamSchema, "params"), userController.deleteUser);

module.exports = router;
