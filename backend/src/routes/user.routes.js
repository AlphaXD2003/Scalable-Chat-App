const {
  test,
  signup,
  login,
  logout,
  getUserInfo,
  verify,
  saveContact,
  getAllContactsOfAuser,
  createGroups,
  getUserDetailsFromEmail,
  getUserDetailsFromUsername,
} = require("../controllers/user.controller");
const { authMiddleware } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

const router = require("express").Router();
//test
router.route("/test").get(test);

// in secure  routes
router.route("/signup").post(upload.single("avatar"), signup);
router.route("/login").post(login);
router.route("/verify/:id").post(verify);

//secure routes
router.route("/logout").post(authMiddleware, logout);
router.route("/userinfo").post(authMiddleware, getUserInfo);
router.route("/emaildetails").post(authMiddleware, getUserDetailsFromEmail);
router
  .route("/usernamedetails")
  .post(authMiddleware, getUserDetailsFromUsername);

//contact
router.route("/save").post(authMiddleware, saveContact);
router.route("/contact").post(authMiddleware, getAllContactsOfAuser);

module.exports = router;
