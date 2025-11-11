const express = require("express");
const {
  testAdmin,
  login,
  createAdmin,
} = require("../controller/adminController");
const {
  getAllMembers,
  updateMember,
  deleteMember,
} = require("../controller/formCrud");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

router.get("/test", testAdmin);

router.post("/login", login);

router
  .route("/:id")
  .get(verifyToken, getAllMembers)
  .put(verifyToken, updateMember)
  .delete(verifyToken, deleteMember)
  .post(verifyToken, createAdmin);
