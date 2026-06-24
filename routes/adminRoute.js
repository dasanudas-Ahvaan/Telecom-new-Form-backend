const express = require("express");
const {
  testAdmin,
  login,
  createAdmin,
} = require("../controller/adminController");
const {
  getAllMembers,
  updateMember,
  deactivateMember,
} = require("../controller/formCrud");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/test", testAdmin);
router.post("/login", login);

router.get("/members", verifyToken, getAllMembers);
router.put("/members/:id", verifyToken, updateMember);
router.delete("/members/:id", verifyToken, deactivateMember);
router.post("/create-admin/:id", verifyToken, createAdmin);

module.exports = router;

