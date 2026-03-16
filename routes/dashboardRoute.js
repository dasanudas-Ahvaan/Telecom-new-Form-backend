const express = require("express");
const {
  testAdmin,
  login,
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

router
  .route("/:id")
  .get(verifyToken, getAllMembers)
  .put(verifyToken, updateMember)
  .delete(verifyToken, deactivateMember)
  // .post(verifyToken, createAdmin);

module.exports = router;
//improve above 3 blue controllers then test
