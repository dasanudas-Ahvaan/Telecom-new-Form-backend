// routes/Admin.js
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
const { Admin } = require("../models/adminSchema");
const verifyCSRF = require("../middleware/csrfCheck");

// All routes require authentication
router.use(verifyCSRF);
router.use(verifyToken);
const entity = "Super_User";

router.post(
  "/create/:id",
  withAudit(createAdminController, {
    action: "CREATE_ADMIN",
    entity,
  }),
);

router.delete(
  "/remove/:id/:adminId",
  withAudit(removeAdminController, {
    action: "DELETE_ADMIN",
    entity,
  }),
);

router.put(
  "/reset-password/:id",
  withAudit(resetAdminPasswordController, {
    action: "RESET_PASS",
    entity,
  }),
);
router.get("/list/:id", getAllAdmins);

module.exports = router;
