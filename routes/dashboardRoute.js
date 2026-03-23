const express = require("express");
const { testAdmin, loginController } = require("../controller/adminController");
const {
  getAllMembers,
  updateMemberController,
  deactivateMember,
} = require("../controller/formCrud");
const { verifyToken } = require("../middleware/auth");
const { withAudit } = require("../utils/withAudit");
const router = express.Router();

router.get("/test", testAdmin);

router.post("/login", loginController);

router
  .route("/:id")
  .get(verifyToken, getAllMembers)
  .put(
    verifyToken,
    withAudit(updateMemberController, {
      action: "Update Registered Member data by admin/super_user",
      entity: "Registered Member data",
    }),
  )
  .delete(verifyToken, deactivateMember);
// .post(verifyToken, createAdmin);

module.exports = router;
//improve above 3 blue controllers then test
