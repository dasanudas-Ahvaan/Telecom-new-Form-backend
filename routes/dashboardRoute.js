const express = require("express");
const {
  testAdmin,
  loginController,
  logoutController,
  rotateRefreshToken,
} = require("../controller/adminController");
const {
  getAllMembers,
  updateMemberController,
  deactivateMember,
} = require("../controller/formCrud");
const { verifyToken } = require("../middleware/auth");
const { withAudit } = require("../utils/withAudit");
const verifyCSRF = require("../middleware/csrfCheck");
const router = express.Router();

router.get("/test", verifyCSRF, testAdmin);

router.get("/me", verifyToken, (req, res) => {
  // verifyToken has already attached the user to req.user
  const { id: _id, role, email } = req.user;
  res.status(200).json({ success: true, data: { _id, role } });
});

router.post("/refresh", rotateRefreshToken);

router.post("/login", loginController);
router.post("/logout", logoutController);

router
  .route("/:id")
  .get(verifyCSRF, verifyToken, getAllMembers)
  .put(
    verifyCSRF,
    verifyToken,
    withAudit(updateMemberController, {
      action: "Update Registered Member data by admin/super_user",
      entity: "Registered Member data",
    }),
  )
  .delete(verifyCSRF, verifyToken, deactivateMember);
// .post(verifyToken, createAdmin);

module.exports = router;
//improve above 3 blue controllers then test
