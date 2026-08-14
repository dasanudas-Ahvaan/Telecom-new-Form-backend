const express = require("express");
const router = express.Router();
const {
  createAdminController,
  resetAdminPasswordController,
  getAllAdmins,
  removeAdminController,
} = require("../controller/adminController");
const { verifyToken } = require("../middleware/auth");
const { withAudit } = require("../utils/withAudit");
const verifyCSRF = require("../middleware/csrfCheck");
const { validateSuperUser } = require("../middleware/superUserValidator");

// All routes require authentication
router.use(verifyCSRF);
router.use(verifyToken);
router.use(validateSuperUser);
const entity = "Super_User";

router.post(
  "/create/",
  withAudit(createAdminController, {
    action: "CREATE_ADMIN",
    entity,
  }),
);

router.delete(
  "/remove/:adminId",
  withAudit(removeAdminController, {
    action: "DELETE_ADMIN",
    entity,
  }),
);

router.put(
  "/reset-password/",
  withAudit(resetAdminPasswordController, {
    action: "RESET_PASS",
    entity,
  }),
);
router.get("/list/", getAllAdmins);

module.exports = router;
