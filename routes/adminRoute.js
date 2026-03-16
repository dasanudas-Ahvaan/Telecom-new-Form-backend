// routes/Admin.js
const express = require("express");
const router = express.Router();
const {
  createAdmin,
  removeAdmin,
  resetAdminPassword,
  getAllAdmins,
} = require("../controller/adminController");
const { verifyToken } = require("../middleware/auth");

// All routes require authentication
router.use(verifyToken);

router.post("/create/:id", createAdmin);
router.delete("/remove/:id/:adminId", removeAdmin);
router.put("/reset-password/:id", resetAdminPassword);
router.get("/list/:id", getAllAdmins);

module.exports = router;