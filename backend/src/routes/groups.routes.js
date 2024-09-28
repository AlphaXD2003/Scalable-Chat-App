const {
  createGroups,
  addMembers,
  removeMembers,
  updateGroup,
  addAdmin,
  removeAdmin,
  deleteGroup,
  fetchGroupsByUsername,
  getGroupDetilsByname,
} = require("../controllers/groups.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

const router = require("express").Router();
router
  .route("/create_group")
  .post(upload.single("group_avatar"), authMiddleware, createGroups);

router.route("/add").post(authMiddleware, addMembers);
router.route("/remove").post(authMiddleware, removeMembers);
router
  .route("/update/:gname")
  .post(upload.single("group_avatar"), authMiddleware, updateGroup);
router.route("/admin/add/:gname").post(authMiddleware, addAdmin);
router.route("/admin/remove/:gname").post(authMiddleware, removeAdmin);
router.route("/delete/:gname").delete(authMiddleware, deleteGroup);
router.route("/groups_username").post(authMiddleware, fetchGroupsByUsername);
router.route("/group_details_name").post(authMiddleware, getGroupDetilsByname);

module.exports = router;
