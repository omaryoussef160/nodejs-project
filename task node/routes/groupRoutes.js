const express = require("express");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createGroupSchema,
  addMemberSchema,
  permissionSchema,
  addAdminSchema,
  updateGroupSchema,
  idParamSchema,
  groupMemberParamsSchema,
} = require("../validations/schemas");
const groupController = require("../controllers/groupController");

const router = express.Router();

router.use(protect);

router.get("/", groupController.getAllGroups);
router.post("/", validate(createGroupSchema), groupController.createGroup);

router.get("/:id", validate(idParamSchema, "params"), groupController.getGroup);
router.patch(
  "/:id",
  validate(idParamSchema, "params"),
  validate(updateGroupSchema),
  groupController.updateGroup
);
router.delete("/:id", validate(idParamSchema, "params"), groupController.deleteGroup);

router.post(
  "/:id/members",
  validate(idParamSchema, "params"),
  validate(addMemberSchema),
  groupController.addMember
);

router.delete(
  "/:id/members/:userId",
  validate(groupMemberParamsSchema, "params"),
  groupController.removeMember
);

router.patch(
  "/:id/permissions",
  validate(idParamSchema, "params"),
  validate(permissionSchema),
  groupController.updatePermission
);

router.post(
  "/:id/admins",
  validate(idParamSchema, "params"),
  validate(addAdminSchema),
  groupController.addAdmin
);

module.exports = router;
